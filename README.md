# Geranium

The following commands are written for Debian 9.9, NodeJS v.12.6.0 and should be executed in sequence. 
Skip those unnecessary for your working environment, if needed.

## Dependancies

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

If compiling process is successful (```Compiled successfully``` in console) a browser window will be automatically opened at the address of the local server. If not try the following address in your browser: ```localhost:8100```

To stop the development server press Ctrl-C
