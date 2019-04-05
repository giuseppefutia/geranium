import json
import pprint
from rdflib import URIRef, Literal, Namespace, Graph
from rdflib.namespace import FOAF

def add_author_name(author):
	if author['authority'] not in authors:
		graph.add( ( GERANIUM_AUT[author['authority']],
			FOAF.name,
			Literal(author['author']) ) )
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
PURL = Namespace("http://purl.org/dc/terms/")

# create RDF graph
graph = Graph()

# authors set
authors = set()

# list for publications URIs
for record in records:
	try:
		# add publication abstract relationship
		graph.add( (GERANIUM_PUB[str(record['handle'])], 
		PURL.abstract, 
		Literal(record['metadata']['dc.description.abstract'][0]['value'])) )
		
	except:
		pass

	# add publication creator relationship
	author = record['internalAuthors'][0]
	graph.add( ( GERANIUM_PUB[str(record['handle'])], 
				PURL.creator,
				GERANIUM_AUT[author['authority']] ) )
	# add author name relationship
	add_author_name(author)
	
	# add publication contributor relationship
	for author in record['internalAuthors'][1:]:
			graph.add( ( GERANIUM_PUB[str(record['handle'])], 
				PURL.contributor,
				GERANIUM_AUT[author['authority']]) )
			# add author name relationship
			add_author_name(author)

# serialize graph
serialized = graph.serialize(format='xml')
with open('serialized.rdf','wb') as file:
	file.write(serialized)
