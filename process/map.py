import json
import pprint
import time
import sys
import logging
import argparse
import requests
import threading
from rdflib import URIRef, Literal, Namespace, Graph
from rdflib.namespace import FOAF, XSD, RDF, RDFS
from urllib.parse import quote
from concurrent.futures import ThreadPoolExecutor
import os.path
import sparql as sparqlQueries
from langdetect import detect

#settings
logging.basicConfig(level=logging.DEBUG)
pref_format='xml'

# define namespaces
BASE_URL = 'http://geranium-project.org/'
GERANIUM_PUB = Namespace(BASE_URL + "publications/")
GERANIUM_AUT = Namespace(BASE_URL + "authors/")
GERANIUM_JOU = Namespace(BASE_URL + "journals/")
GERANIUM_KEY = Namespace(BASE_URL + "keywords/")
PURL = Namespace("http://purl.org/dc/terms/")

# define types
GERANIUM_ONTOLOGY = URIRef(BASE_URL + "ontology/")
GERANIUM_ONTOLOGY_PUB = URIRef(GERANIUM_ONTOLOGY + "Publication")
GERANIUM_ONTOLOGY_AUT = URIRef(GERANIUM_ONTOLOGY + "Author")
GERANIUM_ONTOLOGY_JOU = URIRef(GERANIUM_ONTOLOGY + "Journal")
GERANIUM_ONTOLOGY_TMF = URIRef(GERANIUM_ONTOLOGY + "TMFResource")
GERANIUM_ONTOLOGY_KEY = URIRef(GERANIUM_ONTOLOGY + "AuthorKeyword")

# authors set
authors = set()

#threading locks for the graph, the progress bar counter and the authors set
lock_graph = threading.Lock()
lock_progress = threading.Lock()
lock_authors = threading.Lock()

#Number of records
num_records = 0

progress = 0
def progressBar(value, endvalue, bar_length=20):
    percent = float(value) / endvalue
    arrow = '-' * int(round(percent * bar_length) - 1) + '>'
    spaces = ' ' * (bar_length - len(arrow))

    sys.stdout.write("\rPercent: [{0}] {1}%".format(
        arrow + spaces, int(round(percent * 100))))
    sys.stdout.flush()


def assign_label_json(topics, graph: Graph):
    for uri in topics:
        graph.add((uri,
                   RDFS.label,
                   Literal(topics[uri])))


def assign_label_tmf(topics, graph: Graph):
    for uri in topics:
        graph.add((URIRef(uri),
                   RDFS.label,
                   Literal(topics[uri])))


def assign_type(topics, subject_type, graph: Graph):
    for topic in topics:
        graph.add((topic,
                   RDF.type,
                   subject_type))


def get_topics(text, num_topics=7, lang="english"):
    """
    Sends a POST request to TellMeFirst and retrieves n topics (Where n is equal to num_topics).
    :return: List of strings containing the topic URIs extracted by TellMeFirst
    """
    # TellMeFirst API interaction
    files = {'text': text,
             'numTopics': num_topics,
             'lang': lang}
    r = requests.post(
        url='http://tellmefirst.polito.it:2222/rest/classify', files=files)

    topics = {}
    if r.status_code == 200:
        data = r.json()
        for resource in data['Resources']:
            topics.update({resource['@uri']: resource['@label']})

    return topics


def add_author(author, authors, graph: Graph):
    '''
    Add author entity to the graph
    '''
    lock_authors.acquire()
    logging.debug('Acquired author lock!')
    if not author['authority']:
        if author['author']:
            author['authority'] = quote(author['author'])
        else:
            return
    if author['authority'] not in authors:
        # author type
        graph.add((GERANIUM_AUT[author['authority']],
                   RDF.type,
                   GERANIUM_ONTOLOGY_AUT))
        # add author name relationship
        graph.add((GERANIUM_AUT[author['authority']],
                   FOAF.name,
                   Literal(author['author'])))
        # add identifier property
        graph.add((GERANIUM_AUT[author['authority']],
                   PURL.identifier,
                   Literal(author['authority'])))
        # add label property
        graph.add((GERANIUM_AUT[author['authority']],
                   RDFS.label,
                   Literal(author['author'])))
        
        authors.add(author['authority'])
    logging.debug('Released author lock!')
    lock_authors.release()

def buildGraphFromPublicationsDump(publicationsDumpPath: str,graph=Graph()) -> Graph:
    
    def process_record(record):
        topics = []
        abstract = None
        json_topics = []
        json_topics_clean = []
        tmf_topics = []

        logging.debug('Processing a record...')
        lock_graph.acquire()
        logging.debug('Acquired graph lock!')
        try:
            # publication type
            graph.add((GERANIUM_PUB[str(record['handle'])],
                        RDF.type,
                        GERANIUM_ONTOLOGY_PUB))
            # add publication abstract relationship
            abstract = record['metadata']['dc.description.abstract'][0]['value']
            graph.add((GERANIUM_PUB[str(record['handle'])],
                        PURL.abstract,
                        Literal(abstract)))

        except Exception:
            pass

        try:
            # add title as label property
            title = record['metadata']['dc.title'][0]['value']
            graph.add((GERANIUM_PUB[str(record['handle'])],
                        RDFS.label,
                        Literal(title)))
        except:
            pass
        logging.debug('Released graph lock!')
        lock_graph.release()

        try:
            # add topics to publication
            json_topics = record['metadata']['dc.subject.keywords'][0]['value']

            if json_topics:
                json_topics = json_topics.replace('#', ';').replace('\t', ';').replace(
                    '\r\n', ';').replace(',', ';').replace('·', ';').split(';')
                json_topics_clean = [str(quote(t.strip()))
                                        for t in json_topics]
                json_topics_clean = [GERANIUM_KEY[t]
                                        for t in json_topics_clean if len(t) > 0]
                assign_label_json(
                    dict(zip(json_topics_clean, json_topics)), graph)
                assign_type(json_topics_clean, GERANIUM_ONTOLOGY_KEY, graph)
        except Exception:
            pass

        try:
            num_topics = 7
            if detect(abstract) == 'it':
                tmf_topics = get_topics(abstract, num_topics, 'italian')
            else:
                tmf_topics = get_topics(abstract, num_topics)

            assign_label_tmf(tmf_topics, graph)
            tmf_topics = [URIRef(uri) for uri in [*tmf_topics]]
            assign_type(tmf_topics, GERANIUM_ONTOLOGY_TMF, graph)
        except Exception:
            pass


        topics.extend(json_topics_clean)
        topics.extend(tmf_topics)

        lock_graph.acquire()
        logging.debug('Acquired graph lock 2!')
        if topics:
            for topic in topics:
                graph.add((GERANIUM_PUB[str(record['handle'])],
                            PURL.subject,
                            URIRef(topic)))

        # add publication identifier relationship
            graph.add((GERANIUM_PUB[str(record['handle'])],
                        PURL.identifier,
                        Literal(str(record['handle']))))
        # add publication submission date relationship
        graph.add((GERANIUM_PUB[str(record['handle'])],
                    PURL.dateSubmitted,
                    Literal(str(record['lookupValues']['subdate'])[:10], datatype=XSD.date)))

        # control if the publication is associated with a journal
        if record['lookupValues']['jissn']:
            jissn = str(record['lookupValues']['jissn']).strip()
            # journal type
            graph.add((GERANIUM_JOU[jissn],
                        RDF.type,
                        GERANIUM_ONTOLOGY_JOU))
            # add journal entity
            graph.add((GERANIUM_JOU[jissn],
                        PURL.identifier,
                        Literal(jissn)))
            # add journal title to journal as label
            graph.add((GERANIUM_JOU[jissn],
                        RDFS.label,
                        Literal(str(record['lookupValues']['jtitle']))))
            # add journal title to journal as title
            graph.add((GERANIUM_JOU[jissn],
                        PURL.title,
                        Literal(str(record['lookupValues']['jtitle']))))
            # add publication journal relationship
            graph.add((GERANIUM_PUB[str(record['handle'])],
                        PURL.publisher,
                        GERANIUM_JOU[jissn]))
        
        # add publication creator relationship
        author = record['internalAuthors'][0]
        add_author(author, authors, graph)
        if author['authority']:
            graph.add((GERANIUM_PUB[str(record['handle'])],
                        PURL.creator,
                        GERANIUM_AUT[author['authority']]))

        # add publication contributor relationship
        for author in record['internalAuthors'][1:]:
            add_author(author, authors, graph)
            if author['authority']:
                graph.add((GERANIUM_PUB[str(record['handle'])],
                            PURL.contributor,
                            GERANIUM_AUT[author['authority']]))
        logging.debug('Released graph lock 2!')
        lock_graph.release()

        lock_progress.acquire()
        logging.debug('Acquired progress bar lock!')
        global progress
        progress+=1
        progressBar(progress, num_records, bar_length=100)
        logging.debug('Released progress bar lock!')
        lock_progress.release()

    # read json file
    with open(publicationsDumpPath, 'r') as file:
        content = file.read()

    # create records list, every element in records is a dictionary
    records = json.loads(content)['records']
    global num_records
    num_records = len(records)

    # list for publications URIs
    with ThreadPoolExecutor(max_workers = 10) as executor:
        executor.map(process_record, records)
    
    return graph


def addImgURLtoTopics(g: Graph):
    '''
    for each topic in the graph, adds the FOAF.image relation to the URIref of the retrived image.
    '''
    for topic in g.subjects(RDF.type, GERANIUM_ONTOLOGY_TMF):
        # try getting the thumbnail from dbpedia
        topicImgURI = getDBpediaThumbnail(topic)
        if(topicImgURI != ""):
            g.add((topic, FOAF.img, URIRef(topicImgURI)))
            print("Added {uri}".format(uri=topicImgURI), end="\r")

    print("\nAdded images to topic entities.\n")


def getDBpediaThumbnail(topic: str) -> str:
    query = sparqlQueries.set_dbpedia_thumbnail_query(topic)
    result = requests.get(
        "https://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&format=json&query=" + quote(query))

    if not result.ok:
        return ""  # something went wrong with the http request
    else:
        bindingsList = result.json()['results']['bindings']
        if len(bindingsList) == 0:
            return ""  # no thumbnail available from dbpedia
        else:
            return bindingsList[0]['thumbnail']['value']  # uri of thumbnail


def buildDBpediaAbstractTriples():
    graph = Graph()

    # Read static file of topics
    topics = ""
    with open('topics.json') as file:
        topics = json.load(file)

    for topic in topics:
        url = topic['url']
        abstract = getDBpediaAbstract(url)
        if abstract != "":
            graph.add((URIRef(url), PURL.abstract, Literal(abstract)))

    return graph


def getDBpediaAbstract(topic):
    query = sparqlQueries.set_dbpedia_abstract_query(topic)
    result = requests.get(
        "https://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&format=json&query=" + quote(query))
    if not result.ok:
        return ""  # something went wrong with the http request
    else:
        bindingsList = result.json()['results']['bindings']
        if len(bindingsList) == 0:
            return ""  # no abstract available from dbpedia
        else:
            return bindingsList[0]['abstract']['value']  # uri of thumbnail

def serialize(graph,outputFilename='publicationsGraphWithoutImages.rdf'):
    serialized = graph.serialize(format=pref_format)
    with open(outputFilename, 'wb') as file:
        file.write(serialized)

def update(dump,old_rdf):
    graph = Graph()
    print('Parsing graph...')
    graph.parse(old_rdf,pref_format)
    print('Graph parsed!')
    logging.debug('Got Here!')
    graph = buildGraphFromPublicationsDump(dump,graph)

    serialize(graph)

def build(dump):
    outputFilename = ""
    graph = Graph()

    if os.path.isfile("publicationsGraphWithoutImages.rdf"):  # XXX Temporary
        graph.parse("publicationsGraphWithoutImages.rdf", format=pref_format)
        print("Adding images to graph...\n")
        addImgURLtoTopics(graph)
        outputFilename = "publicationsGraphWithImages.rdf"
    elif os.path.isfile("topics.json"):  # XXX Temporary
        graph = buildDBpediaAbstractTriples()
        outputFilename = "topics.rdf"
    else:
        print("Loading dump: " + dump)
        graph = buildGraphFromPublicationsDump(dump)
        outputFilename = "publicationsGraphWithoutImages.rdf"

    serialize(graph,outputFilename)

def main():
    '''
    Execute the following script if not used as library
    '''
    parser = argparse.ArgumentParser()
    parser.add_argument('dump')
    parser.parse_args()
    logging.debug('Number of args: '+str(len(argv)))
    if(len(argv) == 2):
        build(argv[1])
    elif(len(argv) == 4 and argv[2]=='-u'):
        update(argv[1],argv[3])
    elif(len(argv) == 1):
        build("../data/publications-sample.json")

    # end of main function
    return 0


#----------#
# - Main - #
#----------#
if __name__ == "__main__":
    start_time = time.time()
    main()
    print("--- %s seconds ---" % (time.time() - start_time))
    
