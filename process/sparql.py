def set_authors_query(topic):
    query = ''' \
    PREFIX purl:<http://purl.org/dc/terms/>
    PREFIX dbp:<http://dbpedia.org/resource/>

    SELECT DISTINCT ?a ?a_id ?a_label ?ca ?ca_id ?ca_label
    WHERE {
        ?p purl:subject {t} .
        ?p purl:creator ?a .
        ?a rdfs:label ?a_label .
        ?a purl:identifier ?a_id .
        ?p purl:contributor ?ca .
        ?ca rdfs:label ?ca_label .
        ?ca purl:identifier ?ca_id .
    } \
    '''.format(t=topic)
    return query


def set_publications_query(topic):
    query = ''' \
    PREFIX gpp:<http://geranium-project.org/publications/>
    PREFIX gpk:<http://geranium-project.org/keywords/>
    PREFIX purl:<http://purl.org/dc/terms/>
    PREFIX dbp:<http://dbpedia.org/resource/>
    PREFIX gpo:<http://geranium-project.org/ontology/>

    SELECT DISTINCT ?title ?author ?coauthor ?topic ?date ?abstract ?id
    WHERE {
        ?p purl:subject {t} .
        ?p purl:identifier ?id .
        ?p rdfs:label ?publication .
        ?p purl:creator ?a .
        ?a rdfs:label ?author .
        ?p purl:contributor ?ca .
        ?ca rdfs:label ?coauthor .
        ?p purl:subject ?t .
        ?p rdfs:label ?title .
        ?t rdf:type gpo:TMFResource .
        ?t rdfs:label ?topic .
        ?p purl:abstract ?abstract .
        ?p purl:dateSubmitted ?date .
    }\
    '''.format(t=topic)
    return query


def set_author_details_query(author_url):
    query = ''' \
    PREFIX purl:<http://purl.org/dc/terms/>
    PREFIX gpo:<http://geranium-project.org/ontology/>

    SELECT DISTINCT ?a_id ?a_label ?p ?p_id ?p_label ?t ?t_label ?other_a ?other_a_id
                    ?other_a_label ?other_ca ?other_ca_id ?other_ca_label
    WHERE {
        <{a}> purl:identifier ?a_id .
        <{a}> rdfs:label ?a_label .
        ?p ?property <{a}> .
        ?p a gpo:Publication .
        ?p purl:identifier ?p_id .
        ?p rdfs:label ?p_label .
        ?p purl:subject ?t .
        ?t rdf:type gpo:TMFResource .
        ?t rdfs:label ?t_label .
        ?p purl:dateSubmitted ?date .
        ?p purl:creator ?other_a .
        ?other_a purl:identifier ?other_a_id .
        ?other_a rdfs:label ?other_a_label .
        ?p purl:contributor ?other_ca .
        ?other_ca purl:identifier ?other_ca_id .
        ?other_ca rdfs:label ?other_ca_label .
        FILTER (?property = purl:creator || ?property = purl:contributor)
    }
    \
    '''.format(a=author_url)
    return query
