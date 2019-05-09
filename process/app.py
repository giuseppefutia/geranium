import flask
import requests
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
		result = requests.get('https://blazegraph.nexacenter.org/blazegraph/sparql?query=' + query, auth=HTTPBasicAuth(config.db_user,config.db_password), verify=False)		
		return result.json()
	return 'Invalid arguments!'

if __name__ == '__main__':
	app.run(debug=True)
