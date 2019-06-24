import flask
import requests
import json
import sys
from pprint import pformat
from requests.auth import HTTPBasicAuth
from flask import Flask, jsonify
from urllib.parse import unquote, quote
from sparql import *

import config

app = Flask(__name__)


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

        # Add publications on the topic
        publications = final[author]['publications_on_topic']
        author_fields = {'id': 'other_a_id',
                         'name': 'other_a_label',
                         'url': 'other_a'}
        publication_fields = {'id': 'p_id',
                              'title': 'p_label',
                              'url': 'p'}
        publication = set_new_publication(row,
                                          publications,
                                          author_fields,
                                          publication_fields)
        if (publication is not None):
            publications.append(publication)

    # Add topics and co-authors
    for row in data:
        author = row['a_id']['value']
        # Add topics of the publications on the topic
        publications = final[author]['publications_on_topic']
        publication_id = row['p_id']['value']
        publication = next(
            (i for i in publications if i['id'] == publication_id), None)
        if publication is not None:
            topic_fields = {'url': 'all_t',
                            'label': 'all_t_label'}
            topic = set_topic(
                row, publication['topics'], topic_fields)
            if (topic is not None):
                publication['topics'].append(topic)
        # Add co-authors of the publications on the topic
            co_auth_fields = {'id': 'other_ca_id',
                              'name': 'other_ca_label', 'url': 'other_ca'}
            co_author = set_co_author(
                row, publication['co_authors'], co_auth_fields)
            if(co_author is not None):
                publication['co_authors'].append(co_author)

    final = list(final.values())
    return jsonify(final)


def get_publications(data):
    final = {}
    for row in data:
        if not row['id']['value'] in final:
            final[row['id']['value']] = dict()
            final[row['id']['value']]['id'] = row['id']['value']
            final[row['id']['value']]['title'] = row['title']['value']
            final[row['id']['value']]['author'] = [
                row['author']['value']]  # list
            final[row['id']['value']]['abstract'] = row['abstract']['value']
            final[row['id']['value']]['topic'] = list()
        if row['topic']['value'] not in final[row['id']['value']]['topic']:
            final[row['id']['value']]['topic'].append(row['topic']['value'])
        if row['coauthor']['value'] not in final[row['id']['value']]['author']:
            final[row['id']['value']]['author'].append(
                row['coauthor']['value'])
    final = list(final.values())
    return jsonify(final)


def get_author_details(data):
    final = {}
    new_list = list()
    for row in data:
        # Author details
        author = row['a_id']['value']
        if not author in final:
            final[author] = dict()
            final[author]['id'] = row['a_id']['value']
            final[author]['name'] = row['a_label']['value']
        # Publications details
        final[row['a_id']['value']]['publications'] = new_list
        publications = final[row['a_id']['value']]['publications']
        publication_id = row['p_id']['value']
        added_publications = list(
            filter(lambda x: x.get('id') == publication_id, publications))
        if len(added_publications) == 0:
            new_pub = dict()
            new_pub['id'] = row['p_id']['value']
            new_pub['title'] = row['p_label']['value']
            new_pub['url'] = row['p']['value']
            # Add author to the publication
            new_pub['author'] = dict()
            new_pub['author']['id'] = row['other_a_id']['value']
            new_pub['author']['name'] = row['other_a_label']['value']
            new_pub['author']['url'] = row['other_a']['value']
            # Prepare list of co-authors and topics
            new_pub['co_authors'] = list()
            new_pub['topics'] = list()
            publications.append(new_pub)
    # New loop to include topics and co-authors
    for row in data:
        publications = final[author]['publications']
        publication_id = row['p_id']['value']
        publication = next(
            (item for item in publications if item['id'] == publication_id), None)
        if publication is not None:
            # Add topics
            topic_id = row['t']['value']
            added_topics = list(
                filter(lambda x: x.get('url') == topic_id, publication['topics']))
            if len(added_topics) == 0:
                new_topic = dict()
                new_topic['url'] = row['t']['value']
                new_topic['label'] = row['t_label']['value']
                publication['topics'].append(new_topic)
            # Add co-authors
            co_author_id = row['other_ca_id']['value']
            added_co_authors = list(
                filter(lambda x: x.get('id') == co_author_id, publication['co_authors']))
            if len(added_co_authors) == 0:
                new_co_author = dict()
                new_co_author['id'] = row['other_ca_id']['value']
                new_co_author['name'] = row['other_ca_label']['value']
                new_co_author['url'] = row['other_ca']['value']
                publication['co_authors'].append(new_co_author)
    final = list(final.values())
    return jsonify(final)


def set_author_data(row, author_fields):
    author = dict()
    for field, value in author_fields.items():
        author[field] = row[value]['value']
    return author


def set_publication_data(row, pub_fields, auth_fields):
    pub_dict = dict()
    for field, value in pub_fields.items():
        pub_dict[field] = row[value]['value']
    # Include information on the author within the publication
    pub_dict['author'] = set_author_data(row, auth_fields)
    return pub_dict


def set_topic(row, topics, topic_fields):
    topic = None
    topic_id = row[topic_fields['url']]['value']
    n = list(filter(lambda x: x.get('url') == topic_id, topics))
    if len(n) == 0:
        topic = dict()
        for field, value in topic_fields.items():
            topic[field] = row[value]['value']
    return topic


def set_co_author(row, co_authors, co_author_fields):
    co_author = None
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
        # Prepare list of co-authors and topics
        pub['co_authors'] = list()
        pub['topics'] = list()
    return pub


@app.route('/api', methods=['GET'])
def api():
    query = ''

    if flask.request.method == 'GET':
        request_type = flask.request.args.get('type')
        # Manage publications request
        if request_type == 'publications':
            topic = flask.request.args.get('topic')
            lines = flask.request.args.get('lines')
            offset = flask.request.args.get('offset')
            query = set_publications_query(topic, lines, offset)
        # Manage authors request
        elif request_type == 'authors':
            topic = flask.request.args.get('topic')
            lines = flask.request.args.get('lines')
            offset = flask.request.args.get('offset')
            query = set_authors_query(topic, lines, offset)
        # Manage author details request
        elif request_type == 'author':
            topic = flask.request.args.get('topic')
            lines = flask.request.args.get('lines')
            offset = flask.request.args.get('offset')
            url = flask.request.args.get('url')
            query = set_author_details_query(topic, lines, offset, url)

        query = quote(query)  # get url encoding

        result = requests.get('https://blazegraph.nexacenter.org/blazegraph/sparql?format=json&query=' + query,
                              auth=HTTPBasicAuth(
                                  config.db_user, config.db_password),
                              verify=False)
        if not result.ok:
            return "Invalid query!"

        data = result.json()
        data = data['results']['bindings']

        if request_type == 'publications':
            return get_publications(data)
        elif request_type == 'authors':
            return get_authors(data)
        elif request_type == 'author':
            return get_author_details(data)

    return 'Invalid request!'


if __name__ == '__main__':
    app.run(debug=True)
