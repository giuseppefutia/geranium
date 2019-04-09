import json
import pprint
import requests
from rdflib import URIRef, Literal, Namespace, Graph
from rdflib.namespace import FOAF, XSD

def get_topics(text, num_topics=5):
	"""
	Sends a POST request to TellMeFirst and retrieves n topics (Where n is equal to num_topics).
	:return: List of strings containing the topics extracted by TellMeFirst
	"""

	# TellMeFirst API interaction
	files = {'text': text,
	         'numTopics': num_topics,
	         'lang': 'english'}
	r = requests.post(url='http://tellmefirst.polito.it:2222/rest/classify', files=files)

	topics = []
	if r.status_code == 200:
	    data = r.json()
	    for resource in data['Resources']:
	        topics.append(resource['@label'])
	return topics

def add_author(author):
	if author['authority'] not in authors  and author['authority']:
		# add author name relationship
		graph.add( ( GERANIUM_AUT[author['authority']],
			FOAF.name,
			Literal(author['author']) ) )
		# add author identifier relationship
		graph.add( ( GERANIUM_AUT[author['authority']],
			PURL.identifier,
			Literal(author['authority']) ) )

		authors.add(author['authority'])

# read json file
with open('publications-sample.json', 'r') as file:
	content = file.read()

# create records list, every element in records is a dictionary
data = json.loads(content)
records = data['records']

# define namespaces 
GERANIUM_PUB = Namespace("http://geranium-project.org/publications/")
GERANIUM_AUT = Namespace("http://geranium-project.org/authors/")
GERANIUM_JOU = Namespace("http://geranium-project.org/journals/")
PURL = Namespace("http://purl.org/dc/terms/")

# create RDF graph
graph = Graph()

# authors and journals set
authors = set()
journals = set()

# list for publications URIs
for record in records:
	try:
		# add publication abstract relationship
		abstract = record['metadata']['dc.description.abstract'][0]['value']
		graph.add( (GERANIUM_PUB[str(record['handle'])], 
			PURL.abstract, 
			Literal(abstract)) )

		# add topics to publication
		num_topics = 7
		topics = get_topics(abstract, num_topics)
		for topic in topics:
			graph.add( (GERANIUM_PUB[str(record['handle'])], 
				PURL.subject, 
				Literal(topic)) )

	except:
		pass

	# add publication identifier relationship
		graph.add( (GERANIUM_PUB[str(record['handle'])], 
			PURL.identifier, 
			Literal(str(record['handle']))) )
	# add publication submission date relationship
	graph.add( (GERANIUM_PUB[str(record['handle'])], 
		PURL.dateSubmitted, 
		Literal(str(record['lookupValues']['subdate'])[:10], datatype=XSD.date)) )
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
	graph.add( ( GERANIUM_PUB[str(record['handle'])], 
				PURL.creator,
				GERANIUM_AUT[author['authority']] ) )
	add_author(author)
	
	# add publication contributor relationship
	for author in record['internalAuthors'][1:]:
		graph.add( ( GERANIUM_PUB[str(record['handle'])], 
			PURL.contributor,
			GERANIUM_AUT[author['authority']]) )
		add_author(author)

# serialize graph
serialized = graph.serialize(format='xml')
with open('serialized.rdf','wb') as file:
	file.write(serialized)
