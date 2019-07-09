import flask
import requests
import json
import sys
from pprint import pformat
from requests.auth import HTTPBasicAuth
from flask import Flask
from urllib.parse import unquote, quote
from sparql import *
from parse import *

import config

app = Flask(__name__)


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
        # Manage publication details request_type
        elif request_type == 'publication':
            lines = flask.request.args.get('lines')
            offset = flask.request.args.get('offset')
            url = flask.request.args.get('url')
            query = set_publication_details_query(lines, offset, url)
        # Manage author details request
        elif request_type == 'author':
            topic = flask.request.args.get('topic')
            lines = flask.request.args.get('lines')
            offset = flask.request.args.get('offset')
            url = flask.request.args.get('url')
            query = set_author_details_query(topic, lines, offset, url)
        # Manage all topics request
        elif request_type == 'topics':
            lines = flask.request.args.get('lines')
            offset = flask.request.args.get('offset')
            query = set_topics_query(lines, offset)

        query = quote(query)  # get url encoding

        result = requests.get('https://blazegraph.nexacenter.org/blazegraph/sparql?format=json&query=' + query,
                              auth=HTTPBasicAuth(
                                  config.db_user, config.db_password),
                              verify=False)
        if not result.ok:
            return 'Invalid query!'

        data = result.json()
        data = data['results']['bindings']

        if request_type == 'publications':
            return get_publications(data)
        elif request_type == 'authors':
            return get_authors(data)
        elif request_type == 'publication':
            return get_publication_details(data)
        elif request_type == 'author':
            return get_author_details(data)
        elif request_type == 'topics':
            return get_topics(data)

    return 'Invalid request!'


if __name__ == '__main__':
    app.run(debug=True)
