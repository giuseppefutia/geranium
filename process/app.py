import flask
import requests
import json
import sys
from pprint import pformat
from requests.auth import HTTPBasicAuth
from flask import Flask, jsonify
from urllib.parse import unquote, quote

import config

app = Flask(__name__)


def get_authors(data):
    final = {}
    for row in data:
        # Base dict for authors
        if not row['a_id']['value'] in final:
            final[row['a_id']['value']] = dict()
            final[row['a_id']['value']]['url'] = row['a']['value']
            final[row['a_id']['value']]['id'] = row['a_id']['value']
            final[row['a_id']['value']]['name'] = row['a_label']['value']
        # Base dict for co_authors
        if not row['ca_id']['value'] in final:
            final[row['ca_id']['value']] = dict()
            final[row['ca_id']['value']]['url'] = row['ca']['value']
            final[row['ca_id']['value']]['id'] = row['ca_id']['value']
            final[row['ca_id']['value']]['name'] = row['ca_label']['value']
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


@app.route('/api', methods=['GET'])
def api():
    query = ''

    if flask.request.method == 'GET':
        query = flask.request.args.get('query')
        request_type = flask.request.args.get('type')

    if query:
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

    return 'Invalid request!'


if __name__ == '__main__':
    app.run(debug=True)
