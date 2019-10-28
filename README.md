# Geranium
Geranium is a system to empower the access to the Politecnico di Torino research activities (available within the [IRIS](https://iris.polito.it/) portal) using semantic technologies and deep learning techniques applied on graphs.

The system consists of three main components:
1. *KG Generator*: the goal of this component is to produce a KG from the JSON representation of IRIS data.
2. *Back-end*: the goal of this component is to provide RESTful APIs to access data within the KG.
3. *Front-end*: the goal of this component is to visualize and enable an interactive exploration of the results obtained from the back-end.

## KG Generator
To generate the KG from the JSON representation of IRIS data, you can run the ```map.py``` script.
The script offers many options, which can be reviewed by using the help option:

```
$ cd process
$ python map.py -h
```

The options for this script are the the following:
```
-b <json_file>        : builds a rdf file starting from a provided json file
-o <output_file>      : used to specify the output filename. If not specified, one including the timestamp is automatically provided
-n <number_of_topics> : used to specify the number of topics to extract with TellMeFirst from each abstract
-d                    : turn on debug messages
-f <file_format>      : used to specify the file format (XML by default)
```

## Back-end

Install Python backend using conda environment

```bash
$ conda create -n geranium python=3.6
$ conda activate geranium
$ conda install requests
$ conda install -c conda-forge rdflib
$ conda install -c anaconda flask
$ pip install config
$ pip install langdetect
```

### API

#### Start API
While in the conda environment:
```
python app.py
```

#### Get publications on a specific topic

##### Parameters:
* type: publications
* topic: "Encoded label of topic"
* limit: "Number of lines"
* offset: "Offset within the response"

##### Example:
http://localhost:5000/api?type=publications&topic=Carbon%20nanotube&lines=10000&offset=0

#### Get authors working on a specific topic

##### Parameters:
* type: authors
* topic: "Encoded label of topic"
* limit: "Number of lines"
* offset: "Offset within the response"

##### Example:
http://localhost:5000/api?type=authors&topic=Carbon%20nanotube&lines=10000&offset=0

#### Get details on a specific publication

##### Parameters:
* type: publication
* limit: "Number of lines"
* offset: "Offset within the response"
* url: "Encoded url of a publication"

##### Example:
http://localhost:5000/api?type=publication&lines=10000&offset=0&url=http://geranium-project.org/publications/11583/2647453

#### Get details on an author working on a specific topic

##### Parameters:
* type: author
* topic: "Encoded label of topic"
* limit: "Number of lines"
* offset: "Offset within the response"
* url: "Encoded url of a researcher"

##### Example:
http://localhost:5000/api?type=author&topic=Carbon%20nanotube&lines=10000&offset=0&url=http://geranium-project.org/authors/rp07931

#### Get all topics

##### Parameters:
* type: topics
* limit: "Number of lines"
* offset: "Offset within the response"

##### Example:
http://localhost:5000/api?type=topics&lines=100000&offset=0

#### Get abstract of a single topic

##### Parameters:
* type: abstract
* topic: DBpedia URI of the topic

##### Example:
http://localhost:5000/api?type=abstract&topic=http://dbpedia.org/resource/2D_computer_graphics

## Frontend
The following commands are written for Debian 9.9, NodeJS v.12.6.0 and should be executed in sequence.
Skip those unnecessary for your working environment, if needed.

### NodeJS and NPM

```bash
 $ sudo apt install nodejs
```

### Ionic framework

```bash
 $ sudo npm install -g ionic
```

## Installation

### Node Modules

 * Clone the repository
 * Navigate to website folder
 * Run ```$ npm i```

### Starting Ionic development server

 * Navigate to website folder
 * Run ```$ ionic serve```

 If compiling process is successful (```Compiled successfully``` in console) a browser window will be automatically opened at the address of the local server. If not try the following address in your browser: ```localhost:8100```.

 To stop the development server press Ctrl-C.
