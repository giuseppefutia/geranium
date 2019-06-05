import flask
import requests
import json
import sys
from pprint import pformat
from requests.auth import HTTPBasicAuth
from flask import Flask
from urllib.parse import unquote, quote

import config

app = Flask(__name__)

@app.route('/api', methods=['GET'])
def api():
	query = ''
	if flask.request.method == 'GET':
		query = flask.request.args.get('query')
	if query:
		result = requests.get('https://blazegraph.nexacenter.org/blazegraph/sparql?format=json&query=' + query, auth=HTTPBasicAuth(config.db_user,config.db_password), verify=False)
		data = result.json()['results']['bindings']
		final = {}
		for row in data:
			if not row['id']['value'] in final:
				final[row['id']['value']]=dict()
				final[row['id']['value']]['id'] = row['id']['value']
				final[row['id']['value']]['title'] = row['title']['value']
				final[row['id']['value']]['author'] = [row['author']['value']] # list
				final[row['id']['value']]['abstract'] = row['abstract']['value']
				final[row['id']['value']]['topic'] = list()
			if row['topic']['value'] not in final[row['id']['value']]['topic']:
				final[row['id']['value']]['topic'].append(row['topic']['value'])
			if row['coauthor']['value'] not in final[row['id']['value']]['author']:
				final[row['id']['value']]['author'].append(row['coauthor']['value'])
		final = json.dumps(list(final.values()))
		with open("test.json",'w') as test:
			test.write(final)	
		return pformat(final)
	return 'Invalid arguments!'

if __name__ == '__main__':
	app.run(debug=True)
