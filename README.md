# OAI-PMH Harvester

OAI-PMH Harvester prototype based on the [Aggregator](http://www.openarchives.org/OAI/2.0/guidelines-aggregator.htm) documentation.

## Dependencies

* Node 10+
* Typescript 3+
* npm 5.6.0+

## Capabilities

Common provider supports `Identify`, `ListMetadataFormats`, `GetRecord`, `ListIdentifiers` and `ListRecords`. The optional
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

## Setup mongodb

For mongodb, you need a mongodb instance running in the background.
It can serve on localhost at port 27017.
It should provide database with a collection as defined in the mongo-dao.ts connector.

## Routes (common provider):

The Express server will start on default port 3000.  

* [`http://localhost:3000/scicat/oai?verb=Identify`](http://localhost:3000/scicat/oai?verb=Identify)
* [`http://localhost:3000/scicat/oai?verb=ListMetadataFormats`](http://localhost:3000/scicat/oai?verb=ListMetadataFormats)
* [`http://localhost:3000/scicat/oai?verb=GetRecord&identifier=1&metadataPrefix=oai_dc`](http://localhost:3000/scicat/oai?verb=GetRecord&identifier=1&metadataPrefix=oai_dc)
* [`http://localhost:3000/scicat/oai?verb=ListIdentifiers&metadataPrefix=oai_dc`](http://localhost:3000/scicat/oai?verb=ListIdentifiers&metadataPrefix=oai_dc)
* [`http://localhost:3000/scicat/oai?verb=ListRecords&metadataPrefix=oai_dc`](http://localhost:3000/scicat/oai?verb=ListRecords&metadataPrefix=oai_dc)



## Run in *production* mode (harvester part):

At the simplest level:
```
npm install
npm run compile
npm start
```

The gulp tasks compile Typescript and copy files to `dist` and `dist_provider`.

The project can be deployed to a production server and started with `node index` from within `dist`. Runtime configurations
can be adjusted using `.env` and (recommended) external configuration files created for your environment. We typically run as server daemon using [forever](https://github.com/foreverjs/forever), or some tool 
to assure that the server runs continuously.  

## Dockerize:

#### Create images:
```
npm install
npm run compile
npm run compile-provider
. docker_build.sh
```

#### Test environment:

![Architecture](https://raw.githubusercontent.com/panosc-eu/harvest-api/dev/federated_harvester/docs/assets/images/architecture.png "The Architecture logo") 

Start test environment:

```
docker-compose -f docker-compose-test.yaml up -d
```

Upload test data:

```
node test/upload.js oai-publications-01 '{"oaiIdentifier":"191234/PAN-TESTDATA.TEST-001", "title":"Test document", "description":"Test document", "publicationYear":"2020", "creator":"Test Creator", "affiliation":"PAN", "publisher":"PAN"}'
```

```oai-publications-01``` is the database identifier. Test enviroment contains the next databases:
* oai-publications-01
* oai-publications-02
* oai-publications-03
* oai-publications-04
* oai-publications-05
* oai-publications-06

