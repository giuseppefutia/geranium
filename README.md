# Geranium

## API

### Get publications on a specific topic

Parameters:
* type: publications
* topic: "Encoded label of topic"
* limit: "Number of lines"
* offset: "Offset within the response"

http://localhost:5000/api?type=publications&topic=Carbon%20nanotube&lines=10000&offset=0

### Get authors working on a specific topic

Parameters:
* type: authors
* topic: "Encoded label of topic"
* limit: "Number of lines"
* offset: "Offset within the response"

http://localhost:5000/api?type=authors&topic=Carbon%20nanotube&lines=10000&offset=0

### Get details on an author working on a specific topic

Parameters:
* type: author
* topic: "Encoded label of topic"
* limit: "Number of lines"
* offset: "Offset within the response"
* url: "Encoded url of a researcher"

Example:

http://localhost:5000/api?type=author&topic=Carbon%20nanotube&lines=10000&offset=0&url=http://geranium-project.org/authors/rp07931
