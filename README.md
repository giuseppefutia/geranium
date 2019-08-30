# Geranium

## Install

### Python back-end

Install Python back-end using conda environment

```bash
$ conda create -n geranium python=3.6
$ conda activate geranium
$ conda install requests
$ conda install -c conda-forge rdflib
$ conda install -c anaconda flask
$ pip install config
$ pip install langdetect
```

## API

### Start API
While in the conda environment:
```
python app.py
```

### Get publications on a specific topic

#### Parameters:
* type: publications
* topic: "Encoded label of topic"
* limit: "Number of lines"
* offset: "Offset within the response"

#### Example:
http://localhost:5000/api?type=publications&topic=Carbon%20nanotube&lines=10000&offset=0

### Get authors working on a specific topic

#### Parameters:
* type: authors
* topic: "Encoded label of topic"
* limit: "Number of lines"
* offset: "Offset within the response"

#### Example:
http://localhost:5000/api?type=authors&topic=Carbon%20nanotube&lines=10000&offset=0

### Get details on a specific publication

#### Parameters:
* type: publication
* limit: "Number of lines"
* offset: "Offset within the response"
* url: "Encoded url of a publication"

#### Example:
http://localhost:5000/api?type=publication&lines=10000&offset=0&url=http://geranium-project.org/publications/11583/2647453

### Get details on an author working on a specific topic

#### Parameters:
* type: author
* topic: "Encoded label of topic"
* limit: "Number of lines"
* offset: "Offset within the response"
* url: "Encoded url of a researcher"

#### Example:
http://localhost:5000/api?type=author&topic=Carbon%20nanotube&lines=10000&offset=0&url=http://geranium-project.org/authors/rp07931

### Get all topics

#### Parameters:
* type: topics
* limit: "Number of lines"
* offset: "Offset within the response"

#### Example:
http://localhost:5000/api?type=topics&lines=100000&offset=0

### Get abstract of a single topic

#### Parameters:
* type: abstract
* topic: DBpedia URI of the topic

#### Example:
http://localhost:5000/api?type=abstract&topic=http://dbpedia.org/resource/2D_computer_graphics
