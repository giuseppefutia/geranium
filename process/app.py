import flask
import requests
from flask import Flask
from urllib.parse import unquote, quote

app = Flask(__name__)

@app.route('/api', methods=['GET'])
def api():
	query = ''
	if flask.request.method == 'GET':
		query = flask.request.args.get('query')
	if query:
		result = requests.get('http://127.0.0.1:7200/repositories/Test?query=' + query)
		return result.text
	return 'Invalid arguments!'

if __name__ == '__main__':
	app.run(debug=True)
