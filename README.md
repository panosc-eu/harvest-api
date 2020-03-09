# OAI-PMH Service

Credit upstream author hatfieldlibrary/oai-provider-service.

OAI-PMH Service is a Nodejs Express application that supports multiple, configurable [OAI-PMH version 2.0](https://www.openarchives.org/OAI/openarchivesprotocol.html) data providers.

OAI-PMH Service borrows from the [Modular OAI-PMH Server](https://github.com/NatLibFi/oai-pmh-server), University of Helsinki, 
The National Library of Finland. 
 

## Dependencies

* Node 8.9.4+
* Typescript 2.7.2+
* npm 5.6.0+

## Capabilities

Supports `Identify`, `ListMetadataFormats`, `GetRecord`, `ListIdentifiers` and `ListRecords`. The optional
`from` and `until` arguments are supported for selective harvesting with `YYYY-MM-DDThh:mm:ssZ` granularity.  `ListSets` is supported for OpenAIRE.  

## Runtime configuration

Environment variables are loaded from a `.env` file into `process.env` using the module [dotenv](https://www.npmjs.com/package/dotenv).  
Create one `.env` file inside the root of the project and another one inside the directory `production`.  
A default `.env` file should contain

```
LOG_LEVEL=info
DB_HOSTNAME=localhost
DB_PORT=27017
DB_COLLECTION_NAME=Publication
DB_DATABASE_NAME=oai-publications
ADMIN_USER_EMAIL=name@somewhere.com
```

## Install It
```
npm install
```

## Setup mongodb

For mongodb, you need a mongodb instance running in the background.
It can serve on localhost at port 27017.
It should provide database with a collection as defined in the mongo-dao.ts connector.

## Run It
#### Run in *development* mode:

```
npm run dev
```

#### Routes:

The Express server will start on default port 3000.  

* [`http://localhost:3000/scicat/oai?verb=Identify`](http://localhost:3000/scicat/oai?verb=Identify)
* [`http://localhost:3000/scicat/oai?verb=ListMetadataFormats`](http://localhost:3000/scicat/oai?verb=ListMetadataFormats)
* [`http://localhost:3000/scicat/oai?verb=GetRecord&identifier=1&metadataPrefix=oai_dc`](http://localhost:3000/scicat/oai?verb=GetRecord&identifier=1&metadataPrefix=oai_dc)
* [`http://localhost:3000/scicat/oai?verb=ListIdentifiers&metadataPrefix=oai_dc`](http://localhost:3000/scicat/oai?verb=ListIdentifiers&metadataPrefix=oai_dc)
* [`http://localhost:3000/scicat/oai?verb=ListRecords&metadataPrefix=oai_dc`](http://localhost:3000/scicat/oai?verb=ListRecords&metadataPrefix=oai_dc)



## Run in *production* mode:

At the simplest level:
```
npm run compile
npm start
```
## Dockerize:

```
npm run compile
docker-compose build
docker-compose up
```

The gulp tasks compile Typescript and copy files to `dist`.

The project can be deployed to a production server and started with `node index` from within `dist`. Runtime configurations
can be adjusted using `.env` and (recommended) external configuration files created for your environment. We typically run as server daemon using [forever](https://github.com/foreverjs/forever), or some tool 
to assure that the server runs continuously.  





