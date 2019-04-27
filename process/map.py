import json
import pprint
import sys
import requests
from rdflib import URIRef, Literal, Namespace, Graph
from rdflib.namespace import FOAF, XSD, RDF, RDFS
from urllib.parse import quote

def progressBar(value, endvalue, bar_length=20):

        percent = float(value) / endvalue
        arrow = '-' * int(round(percent * bar_length)-1) + '>'
        spaces = ' ' * (bar_length - len(arrow))

        sys.stdout.write("\rPercent: [{0}] {1}%".format(arrow + spaces, int(round(percent * 100))))
        sys.stdout.flush()

def assign_label_json(topics):
	for uri in topics:
		graph.add( (uri,
			RDFS.label,
			Literal(topics[uri])) )

def assign_label_tmf(topics):
	for uri in topics:
		graph.add( (URIRef(uri),
			RDFS.label,
			Literal(topics[uri])) )

def assign_type(topics, subject_type):
	for topic in topics:
		graph.add( (topic,
			RDF.type,
			subject_type) )

def get_topics(text, num_topics=7):
	"""
	Sends a POST request to TellMeFirst and retrieves n topics (Where n is equal to num_topics).
	:return: List of strings containing the topic URIs extracted by TellMeFirst
	"""

	# TellMeFirst API interaction
	files = {'text': text,
	         'numTopics': num_topics,
	         'lang': 'english'}
	r = requests.post(url='http://tellmefirst.polito.it:2222/rest/classify', files=files)
	
	topics = {}
	if r.status_code == 200:
	    data = r.json()
	    for resource in data['Resources']:
	        topics.update({resource['@uri']:resource['@label']})
	return topics

def add_author(author):
	'''
	Add author entity to the graph
	'''
	if author['authority'] not in authors:
		# add author name relationship
		graph.add( ( GERANIUM_AUT[author['authority']],
			FOAF.name,
			Literal(author['author']) ) )
		# add identifier property
		graph.add( ( GERANIUM_AUT[author['authority']],
			PURL.identifier,
			Literal(author['authority']) ) )
		# add label property
		graph.add( ( GERANIUM_AUT[author['authority']], 
			RDFS.label,
			Literal(author['author']) ) )

		authors.add(author['authority'])

# read json file
with open('publications-sample.json', 'r') as file:
	content = file.read()

# create records list, every element in records is a dictionary
data = json.loads(content)
records = data['records']

# define namespaces
BASE_URL = 'http://geranium-project.org/'
GERANIUM_PUB = Namespace(BASE_URL+"publications/")
GERANIUM_AUT = Namespace(BASE_URL+"authors/")
GERANIUM_JOU = Namespace(BASE_URL+"journals/")
GERANIUM_KEY = Namespace(BASE_URL+"keywords/") 
PURL = Namespace("http://purl.org/dc/terms/")

# define types
GERANIUM_ONTOLOGY_TMF = URIRef(BASE_URL+"ontology/TMFResource")
GERANIUM_ONTOLOGY_KEY = URIRef(BASE_URL+"ontology/AuthorKeyword")

# create RDF graph
graph = Graph()

# authors and journals set
authors = set()
journals = set()

# list for publications URIs
progress = 0
for record in records:
	topics = []
	abstract = None
	json_topics = []
	tmf_topics = []
	try:
		# add publication abstract relationship
		abstract = record['metadata']['dc.description.abstract'][0]['value']
		graph.add( (GERANIUM_PUB[str(record['handle'])], 
			PURL.abstract, 
			Literal(abstract)) )

	except Exception as error:
		#print(error)
		pass

	try:
		# add title as label property
		title = record['metadata']['dc.title'][0]['value']
		graph.add( (GERANIUM_PUB[str(record['handle'])], 
			RDFS.label, 
			Literal(title)) )
	except:
		pass

	try:
		# add topics to publication		
		json_topics = record['metadata']['dc.subject.keywords'][0]['value']
		
		if json_topics:
			json_topics = json_topics.replace('#',';').replace('\t',';').replace('\r\n',';').replace(',',';').replace('·',';').split(';')
			json_topics_clean = [str(quote(t.strip())) for t in json_topics]
			json_topics_clean = [GERANIUM_KEY[t] for t in json_topics_clean if len(t)>0]
			assign_label_json(dict(zip(json_topics_clean,json_topics)))
			assign_type(json_topics_clean, GERANIUM_ONTOLOGY_KEY)
	except Exception as error:
		print(error)
		pass

	try:
		num_topics = 7
		tmf_topics = get_topics(abstract, num_topics)
		assign_label_tmf(tmf_topics)
		tmf_topics = [URIRef(uri) for uri in [*tmf_topics]]
		assign_type(tmf_topics, GERANIUM_ONTOLOGY_TMF)		
	except Exception as error:
		print(error)
		pass

	topics.extend(json_topics_clean)
	topics.extend(tmf_topics)


	if topics:
		for topic in topics:
			graph.add( (GERANIUM_PUB[str(record['handle'])], 
				PURL.subject, 
				topic) )

	# add publication identifier relationship
		graph.add( (GERANIUM_PUB[str(record['handle'])], 
			PURL.identifier, 
			Literal(str(record['handle']))) )
	# add publication submission date relationship
	graph.add( (GERANIUM_PUB[str(record['handle'])], 
		PURL.dateSubmitted, 
		Literal(str(record['lookupValues']['subdate'])[:10], datatype=XSD.date)) )
	
	# control if the publication is associated with a journal
	if record['lookupValues']['jissn']:
		# add journal entity
		graph.add( (GERANIUM_JOU[str(record['lookupValues']['jissn'])],
			PURL.identifier,
			Literal(str(record['lookupValues']['jissn']))) )
		# add publication journal relationship
		graph.add( (GERANIUM_PUB[str(record['handle'])], 
			PURL.publisher, 
			GERANIUM_JOU[str(record['lookupValues']['jissn'])]) )

	# add publication creator relationship
	author = record['internalAuthors'][0]
	if author['authority']:
		graph.add( ( GERANIUM_PUB[str(record['handle'])], 
			PURL.creator,
			GERANIUM_AUT[author['authority']] ) )
		add_author(author)
	
	# add publication contributor relationship
	for author in record['internalAuthors'][1:]:
		if author['authority']:
			graph.add( ( GERANIUM_PUB[str(record['handle'])], 
				PURL.contributor,
				GERANIUM_AUT[author['authority']]) )
			add_author(author)

	progress+=1
	progressBar(progress, len(records), bar_length=100)

print('\n')

# serialize graph
serialized = graph.serialize(format='xml')
with open('serialized.rdf','wb') as file:
	file.write(serialized)
