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
    for row in data:
        # Base dict for authors
        author = row['a_id']['value']
        if not author in final:
            final[author] = dict()
            final[author]['url'] = row['a']['value']
            final[author]['id'] = row['a_id']['value']
            final[author]['name'] = row['a_label']['value']
        # Base dict for co_authors
        co_author = row['ca_id']['value']
        if not co_author in final:
            final[co_author] = dict()
            final[co_author]['url'] = row['ca']['value']
            final[co_author]['id'] = co_author
            final[co_author]['name'] = row['ca_label']['value']
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
