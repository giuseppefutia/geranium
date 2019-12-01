from flask import jsonify


def get_publications(data):
    final = {}
    for row in data:
        publication = row['p_id']['value']
        if not publication in final:
            publication_fields = {'id': 'p_id', 'title': 'p_label',
                                  'url': 'p', 'submitted_date': 'p_date'}
            author_fields = {'id': 'a_id', 'name': 'a_label', 'url': 'a'}
            final[publication] = set_publication_data(row,
                                                      publication_fields,
                                                      author_fields)
            final[publication]['abstract'] = row['p_abstract']['value']

    # Add topics and co-authors
    for row in data:
        publication_id = row['p_id']['value']
        publication = next(
            (i for i in list(final.values()) if i['id'] == publication_id), None)
        if publication is not None:
            # Add topics of the publications
            topic_fields = {'url': 'other_t',
                            'label': 'other_t_label', 'img': 'other_t_img'}
            topic = set_topic(row, publication['topics'], topic_fields)
            if topic is not None:
                publication['topics'].append(topic)
            # Add co-authors of the publications
            co_auth_fields = {'id': 'ca_id', 'name': 'ca_label', 'url': 'ca'}
            co_author = set_co_author(
                row, publication['co_authors'], co_auth_fields)
            if co_author is not None:
                publication['co_authors'].append(co_author)

    final = list(final.values())
    return jsonify(final)


def get_authors(data):
    final = {}

    # Add authors
    for row in data:
        author = row['a_id']['value']
        if not author in final:
            # Keys are used to fill authors dict, values are SPARQL variables that contain data
            author_fields = {'url': 'a', 'id': 'a_id', 'name': 'a_label'}
            final[author] = set_author_data(row, author_fields)
            final[author]['publications_on_topic'] = list()

    # Add publications
    for row in data:
        author = row['a_id']['value']

        # Add publications
        publications = final[author]['publications_on_topic']
        author_fields = {'id': 'other_a_id',
                         'name': 'other_a_label', 'url': 'other_a'}
        publication_fields = {'id': 'p_id', 'title': 'p_label',
                              'url': 'p', 'submitted_date': 'p_date'}
        publication = set_new_publication(row,
                                          publications,
                                          author_fields,
                                          publication_fields)
        if (publication is not None):
            publications.append(publication)

    # Add topics and co-authors
    for row in data:
        author = row['a_id']['value']
        publications = final[author]['publications_on_topic']
        publication_id = row['p_id']['value']
        publication = next(
            (i for i in publications if i['id'] == publication_id), None)
        if publication is not None:
            # Add topics of the publications
            topic_fields = {'url': 'all_t', 'label': 'all_t_label'}
            topic = set_topic(row, publication['topics'], topic_fields)
            if topic is not None:
                publication['topics'].append(topic)
            # Add co-authors of the publications
            co_auth_fields = {'id': 'other_ca_id',
                              'name': 'other_ca_label',
                              'url': 'other_ca'}
            co_author = set_co_author(
                row, publication['co_authors'], co_auth_fields)
            if co_author is not None:
                publication['co_authors'].append(co_author)

    final = list(final.values())
    return jsonify(final)


def get_publication_details(data):
    final = {}
    for row in data:
        publication = row['p_id']['value']
        author_fields = {'url': 'a', 'id': 'a_id', 'name': 'a_label'}
        publication_fields = {'id': 'p_id', 'title': 'p_label',
                              'url': 'p', 'submitted_date': 'p_date',
                              'abstract': 'p_abstract'}
        final[publication] = set_publication_data(row,
                                                  publication_fields,
                                                  author_fields)
    # Add topics and co-authors
    for row in data:
        publication_id = row['p_id']['value']
        publication = next((i for i in list(final.values())
                            if i['id'] == publication_id), None)
        if publication is not None:
            topic_fields = {'url': 't', 'label': 't_label', 'img': 't_img'}
            topic = set_topic(row, publication['topics'], topic_fields)
            if topic is not None:
                publication['topics'].append(topic)
            co_auth_fields = {'id': 'ca_id',
                              'name': 'ca_label',
                              'url': 'ca'}
            co_author = set_co_author(row,
                                      publication['co_authors'],
                                      co_auth_fields)
            if co_author is not None:
                publication['co_authors'].append(co_author)
    final = list(final.values())
    return jsonify(final)


def get_author_details(data):
    final = {}
    new_list = list()
    for row in data:
        # Author details
        author = row['a_id']['value']
        if not author in final:
            author_fields = {'url': 'a', 'id': 'a_id', 'name': 'a_label'}
            final[author] = set_author_data(row, author_fields)
        # Publications details
        final[author]['publications'] = new_list
        publications = final[author]['publications']
        publication_id = row['p_id']['value']
        author_fields = {'id': 'other_a_id', 'name': 'other_a_label',
                         'url': 'other_a'}
        publication_fields = {'id': 'p_id', 'title': 'p_label',
                              'url': 'p', 'submitted_date': 'p_date'}
        publication = set_new_publication(row,
                                          publications,
                                          author_fields,
                                          publication_fields)
        if publication is not None:
            publications.append(publication)

    # Add topics and co-authors
    for row in data:
        author = row['a_id']['value']
        publications = final[author]['publications']
        publication_id = row['p_id']['value']
        publication = next(
            (i for i in publications if i['id'] == publication_id), None)
        if publication is not None:
            # Add topics
            topic_id = row['other_t']['value']
            topic_fields = {'url': 'other_t', 'label': 'other_t_label', 'img': 'other_t_img'}
            topic = set_topic(row, publication['topics'], topic_fields)
            if topic is not None:
                publication['topics'].append(topic)
            # Add co-authors
            co_auth_fields = {'id': 'other_ca_id', 'name': 'other_ca_label',
                              'url': 'other_ca'}
            co_author = set_co_author(row,
                                      publication['co_authors'],
                                      co_auth_fields)
            if co_author is not None:
                publication['co_authors'].append(co_author)

    final = list(final.values())
    return jsonify(final)


def get_topics(data):
    final = {}
    for row in data:
        topic = {}
        url = row['t']['value']
        label = row['t_label']['value']
        topic['url'] = url
        topic['label'] = label
        final[url] = topic
    final = list(final.values())
    return jsonify(final)


def get_abstract(data):
    final = {}
    for row in data:
        abstract = row['abstract']['value']
    # XXX Need to be checked why it does not exist
    if len(data) == 0:
        final['abstract'] = ''
    else:
        final['abstract'] = abstract
    final = list(final.values())
    return jsonify(final)


def set_author_data(row, author_fields):
    author_data = dict()
    for field, value in author_fields.items():
        author_data[field] = row[value]['value']
    return author_data


def set_publication_data(row, pub_fields, auth_fields):
    publication_data = dict()
    for field, value in pub_fields.items():
        publication_data[field] = row[value]['value']
    # Include information on the author within the publication
    publication_data['author'] = set_author_data(row, auth_fields)
    # Prepare list of co-authors and topics
    publication_data['co_authors'] = list()
    publication_data['topics'] = list()
    return publication_data


def set_topic(row, topics, topic_fields):
    topic = None
    topic_id = row[topic_fields['url']]['value']
    n = list(filter(lambda x: x.get('url') == topic_id, topics))
    if len(n) == 0:
        topic = dict()
        for field, value in topic_fields.items():
            if value in row:
                topic[field] = row[value]['value']
            else:
                topic[field] = ''
    return topic


def set_co_author(row, co_authors, co_author_fields):
    co_author = None
    if co_author_fields['id'] in row: #check if there is a co-author
        co_author_id = row[co_author_fields['id']]['value']
        n = list(filter(lambda x: x.get('id') == co_author_id, co_authors))
        if len(n) == 0:
            co_author = set_author_data(row, co_author_fields)
    return co_author


def set_new_publication(row, publications, author_fields, publication_fields):
    pub = None
    publication_id = row[publication_fields['id']]['value']
    n = list(filter(lambda x: x.get('id') == publication_id, publications))
    if len(n) == 0:
        # Add data on publications and authors
        pub = set_publication_data(row, publication_fields, author_fields)
    return pub
