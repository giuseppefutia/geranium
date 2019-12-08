def set_publications_query(topic, lines, offset):
    query = """ \
    PREFIX purl:<http://purl.org/dc/terms/>
    PREFIX dbp:<http://dbpedia.org/resource/>
    PREFIX gpo:<http://geranium-project.org/ontology/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT DISTINCT ?p ?p_id ?p_label ?p_abstract ?p_date
                    ?a ?a_id ?a_label ?ca ?ca_id ?ca_label
                    ?other_t ?other_t_label ?other_t_img
    WHERE {{
        ?p purl:identifier ?p_id .
        ?p rdfs:label ?p_label .
        ?p purl:abstract ?p_abstract .
        ?p purl:dateSubmitted ?p_date .
        ?p purl:creator ?a .
        ?a purl:identifier ?a_id .
        ?a rdfs:label ?a_label .
        OPTIONAL{{
            ?p purl:contributor ?ca .
            ?ca purl:identifier ?ca_id .
            ?ca rdfs:label ?ca_label .
        }}
        ?p purl:subject ?t .
        ?t rdfs:label "{t}" .
        ?t rdf:type gpo:TMFResource .
        ?p purl:subject ?other_t .
        ?other_t rdf:type gpo:TMFResource .
        ?other_t rdfs:label ?other_t_label .
        OPTIONAL{{
            ?other_t foaf:img ?other_t_img .
        }}
    }} ORDER BY ASC(UCASE(str(?p_label))) LIMIT {l} OFFSET {o} \
    """.format(t=topic, l=lines, o=offset)
    return query


def set_authors_query(topic, lines, offset):
    query = """ \
    PREFIX purl:<http://purl.org/dc/terms/>
    PREFIX dbp:<http://dbpedia.org/resource/>
    PREFIX gpo:<http://geranium-project.org/ontology/>
    SELECT DISTINCT ?a ?a_id ?a_label ?p ?p_id ?p_label ?p_date
                    ?all_t ?all_t_label
                    ?other_a ?other_a_id ?other_a_label
                    ?other_ca ?other_ca_id ?other_ca_label
    WHERE {{
        ?p a gpo:Publication .
        ?p purl:subject ?t .
        ?t rdf:type gpo:TMFResource .
        ?t rdfs:label "{t}" .
        ?p purl:subject ?all_t .
        ?all_t rdf:type gpo:TMFResource .
        ?all_t rdfs:label ?all_t_label .
        ?p purl:identifier ?p_id .
        ?p rdfs:label ?p_label .
        ?p ?property ?a .
        ?a a gpo:Author .
        ?a rdfs:label ?a_label .
        ?a purl:identifier ?a_id .
        ?p purl:creator ?other_a .
        ?p purl:dateSubmitted ?p_date .
        ?other_a purl:identifier ?other_a_id .
        ?other_a rdfs:label ?other_a_label .
        OPTIONAL{{
            ?p purl:contributor ?other_ca .
            ?other_ca purl:identifier ?other_ca_id .
            ?other_ca rdfs:label ?other_ca_label .
        }}
    }} ORDER BY ASC(UCASE(str(?a_label))) LIMIT {l} OFFSET {o} \
    """.format(t=topic, l=lines, o=offset)
    return query


def set_author_details_query(topic, lines, offset, author_url):
    query = """ \
    PREFIX purl:<http://purl.org/dc/terms/>
    PREFIX gpo:<http://geranium-project.org/ontology/>
    SELECT DISTINCT ?a ?a_id ?a_label ?p ?p_id ?p_label ?p_date
                    ?other_t ?other_t_label
                    ?other_a ?other_a_id ?other_a_label
                    ?other_ca ?other_ca_id ?other_ca_label 
                    ?t_img ?other_t_img
    WHERE {{
        <{a}> purl:identifier ?a_id .
        <{a}> rdfs:label ?a_label .
        ?a rdfs:label ?a_label .
        ?p ?property <{a}> .
        ?p a gpo:Publication .
        ?p purl:identifier ?p_id .
        ?p rdfs:label ?p_label .
        ?p purl:subject ?t .
        ?t rdf:type gpo:TMFResource .
        ?t rdfs:label "{t}" .
        ?p purl:subject ?other_t .
        ?other_t rdfs:label ?other_t_label .
        ?other_t rdf:type gpo:TMFResource .
        ?p purl:dateSubmitted ?p_date .
        ?p purl:creator ?other_a .
        ?other_a purl:identifier ?other_a_id .
        ?other_a rdfs:label ?other_a_label .
        OPTIONAL{{
            ?t foaf:img ?t_img .
        }}
        OPTIONAL{{
            ?other_t foaf:img ?other_t_img .
        }}
        OPTIONAL{{
            ?p purl:contributor ?other_ca .
            ?other_ca purl:identifier ?other_ca_id .
            ?other_ca rdfs:label ?other_ca_label .
        }}
        FILTER (?property = purl:creator || ?property = purl:contributor)
    }} LIMIT {l} OFFSET {o}
    \
    """.format(t=topic, l=lines, o=offset, a=author_url)
    return query


def set_publication_details_query(lines, offset, publication_url):
    query = """ \
    PREFIX purl:<http://purl.org/dc/terms/>
    PREFIX gpo:<http://geranium-project.org/ontology/>
    SELECT DISTINCT ?p ?p_id ?p_label ?p_date ?t ?t_label ?a ?a_id ?a_label
                    ?ca ?ca_id ?ca_label ?p_abstract ?s_t ?s_t_label ?s_a ?s_a_label ?s_a_id
                    ?s_ca ?s_ca_id ?s_ca_label ?s_j ?s_j_label ?t_img ?s_t_img
    WHERE {{
        <{p}> purl:identifier ?p_id .
        ?p purl:identifier ?p_id .
        <{p}> rdfs:label ?p_label .
        <{p}> purl:dateSubmitted ?p_date .
        <{p}> purl:subject ?t .
        ?t rdf:type gpo:TMFResource .
        ?t rdfs:label ?t_label .
        <{p}> purl:creator ?a .
        ?a purl:identifier ?a_id .
        ?a rdfs:label ?a_label .
        OPTIONAL {{
            <{p}> purl:contributor ?ca .
            ?ca purl:identifier ?ca_id .
            ?ca rdfs:label ?ca_label .
        }}
        OPTIONAL {{
            <{p}> purl:abstract ?p_abstract .
        }}
        OPTIONAL{{
            ?t foaf:img ?t_img .
        }}
        OPTIONAL {{
            <{p}> gpo:suggestedTopic ?s_t .
            ?s_t rdfs:label ?s_t_label .
            OPTIONAL{{
                ?s_t foaf:img ?s_t_img .
            }}
        }}
        OPTIONAL {{
            <{p}> gpo:suggestedCreator ?s_a .
            ?s_a rdfs:label ?s_a_label .
            ?s_a purl:identifier ?s_a_id .
        }}
        OPTIONAL {{
            <{p}> gpo:suggestedContributor ?s_ca .
            ?s_ca rdfs:label ?s_ca_label .
            ?s_ca purl:identifier ?s_ca_id .
        }}
        OPTIONAL {{
            <{p}> gpo:suggestedJournal ?s_j .
            ?s_j rdfs:label ?s_j_label .
        }}
    }} LIMIT {l} OFFSET {o}
    \
    """.format(l=lines, o=offset, p=publication_url)
    return query


def set_topics_query(lines, offset):
    query = """ \
    PREFIX gpo:<http://geranium-project.org/ontology/>
    SELECT DISTINCT ?t ?t_label
    WHERE {{
        ?t rdf:type gpo:TMFResource .
        ?t rdfs:label ?t_label .
    }} LIMIT {l} OFFSET {o}
    \
    """.format(l=lines, o=offset)
    return query


def set_topic_abstract_query(topic):
    query = """ \
    PREFIX purl:<http://purl.org/dc/terms/>
    SELECT DISTINCT ?abstract
    WHERE {{
        <{t}> purl:abstract ?abstract .
    }}
    \
    """.format(t=topic)
    return query


def set_dbpedia_thumbnail_query(topicUri: str) -> str:
    query = """\
        prefix dbo: <http://dbpedia.org/ontology/>
        select ?thumbnail where {{
        <{t}> dbo:thumbnail ?thumbnail .
        \
        }}""".format(t=topicUri)
    return query


def set_dbpedia_abstract_query(topic_uri):
    query = """ \
    PREFIX dbo: <http://dbpedia.org/ontology/>
    SELECT DISTINCT ?abstract
    WHERE {{
        <{t}> dbo:abstract ?abstract .
        FILTER (langMatches(lang(?abstract),"en"))
    }}
    \
    """.format(t=topic_uri)
    return query
