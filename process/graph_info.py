import logging
import sys
import argparse
from enum import Enum
from rdflib import URIRef, Literal, Namespace, Graph, util
from rdflib.namespace import FOAF, XSD, RDF, RDFS
from urllib.parse import quote
import os.path
import sparql as sparqlQueries

# setup logging
logging.basicConfig(
    stream=sys.stdout,
    level=logging.DEBUG,
    format="[%(name)s - %(levelname)s] %(message)s",
)
logger = logging.getLogger("graph_tester")

# ------------------------------------------------------------------

class GeraniumNamespace(Enum):
    GERANIUM_PUB = Namespace("http://geranium-project.org/publications/")
    GERANIUM_AUT = Namespace("http://geranium-project.org/authors/")
    GERANIUM_JOU = Namespace("http://geranium-project.org/journals/")

class GeraniumOntology(Enum):
    GERANIUM_ONTOLOGY_PUB = URIRef("http://geranium-project.org/ontology/Publication")
    GERANIUM_ONTOLOGY_AUT = URIRef("http://geranium-project.org/ontology/Author")
    GERANIUM_ONTOLOGY_JOU = URIRef("http://geranium-project.org/ontology/Journal")
    GERANIUM_ONTOLOGY_TMF = URIRef("http://geranium-project.org/ontology/TMFResource")
    GERANIUM_ONTOLOGY_KEY = URIRef("http://geranium-project.org/ontology/AuthorKeyword")

# ------------------------------------------------------------------

PURL = Namespace("http://purl.org/dc/terms/")

class PURLTerms(Enum):
    PURL_TERM_SUBJECT = PURL.subject
    PURL_TERM_PUBLISHER = PURL.publisher
    PURL_TERM_CREATOR = PURL.creator
    PURL_TERM_CONTRIBUTOR = PURL.contributor

# ------------------------------------------------------------------


def print_graph_info(g: Graph, ont: Enum):
    # Entities statistics
    # key = class, value = number of instances for such clas
    num_entities_dict = {key.value: 0 for key in ont}

    # Edges statistics
    # key = relation, value = number of edges for such relation
    num_edges_dict = {key.value: 0 for key in PURLTerms if key != PURLTerms.PURL_TERM_SUBJECT}

    keyword_rel = str(PURL.subject + "_keyword") # special case for keyword subject
    num_edges_dict[keyword_rel] = 0

    tmf_rel = str(PURL.subject + "_tmf") # special case for TMF subject
    num_edges_dict[tmf_rel] = 0

    # entity statistics
    nodes = set()
    for (s, p, o) in g:
        for ont_type in [t for t in ont]:
            if (s, RDF.type, ont_type.value) in g:
                nodes.add(s)
            if (o, RDF.type, ont_type.value) in g:
                nodes.add(o)

    for entity in nodes:
        for ont_type in [t for t in ont]:
            if (entity, RDF.type, ont_type.value) in g:
                num_entities_dict[ont_type.value] += 1

    # edges statistics
    for (s, p, o) in g:
        # if it's a triple between nodes
        if s in nodes and o in nodes:
            # first test if relation is special case (subject can be keyword or tmf)
            if p == PURLTerms.PURL_TERM_SUBJECT.value:
                if (o, RDF.type, GeraniumOntology.GERANIUM_ONTOLOGY_TMF.value) in g:
                    num_edges_dict[tmf_rel] += 1
                if (o, RDF.type, GeraniumOntology.GERANIUM_ONTOLOGY_KEY.value) in g:
                    num_edges_dict[keyword_rel] += 1
            else: num_edges_dict[p] += 1 # some other relation, add it

    for statistics_dicts in [num_entities_dict, num_edges_dict]:
        for key, val in statistics_dicts.items():
            logger.debug("%s -> %s" % (key, val))
        logger.debug("\n")


# --------- #
# -  Main - #
# --------- #
if __name__ == "__main__":

    # parse arguments
    parser = argparse.ArgumentParser(description="Graph Tester")
    parser.add_argument("-g", "--graph", help="path to geranium RDF graph")
    args = parser.parse_args()

    if args.graph:
        g = Graph()
        g.parse(args.graph, util.guess_format(args.graph))
        logger.debug("\n*** GERANIUM  RDF Graph info:***\n")
        print_graph_info(g, GeraniumOntology)
