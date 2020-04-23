import http = require('http');
import parseString = require('xml2js');
import equal = require('fast-deep-equal');
import { MongoConnector } from './dao/mongo_dao';
import logger from '../logger'

class DocumentBuilder {
    private keys = {
        resource: null
    };

    protected deepValue(obj, path){
        let result = obj;
        for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
            result = result[path[i]];
            if (result === undefined) {
                return undefined;
            }
        };
        return result;
    }

    protected getResource(record) {
        if (this.keys.resource === null) {
            if (record.metadata[0].oai_datacite !== undefined) {
                this.keys.resource = 'metadata.0.oai_datacite.0.payload.0.datacite:resource.0';
            } else {
                this.keys.resource = 'metadata.0.datacite:resource.0';
            }
        }
        return this.deepValue(record, this.keys.resource);
    }

    protected findElement(resource, key, paths) {
        if (this.keys[key] === undefined) {
            for (let path of paths) {
                const result = this.deepValue(resource, path);
                if (result !== undefined) {
                    this.keys[key] = path;
                    return result;
                }
            }
        }
        const result = this.keys[key] ? this.deepValue(resource, this.keys[key]) : ''
        return result !== undefined ? result : '';
    }

    public extractData(record) {
        const resource = this.getResource(record);
        const oaiIdentifier = this.findElement(record, 'oaiIdentifier', ['header.0.identifier.0._', 'header.0.identifier.0']);

        let description = this.findElement(resource, 'description', [
            'datacite:descriptions.0.description.0._',
            'datacite:descriptions.0.datacite:description.0._',
            'datacite:descriptions.0.description.0',
            'datacite:descriptions.0.datacite:description.0'
        ]);
        if (description['_$'] !== undefined) {
            logger.info('Invalid description: ' + description);
            description = '';
        }

        let data = {
            _id: oaiIdentifier,
            oaiIdentifier: oaiIdentifier,
            pid: oaiIdentifier,
            title: this.findElement(resource, 'title', ['datacite:titles.0.datacite:title.0', 'datacite:titles.0.title.0']),
            dataDescription: description,
            creationTime: new Date(Date.now()),
            publicationYear: this.findElement(resource, 'publicationYear', ['datacite:publicationYear.0']),
            creator: [this.findElement(resource, 'creator', ['datacite:creators.0.creator.0.creatorName.0'])],
            affiliation: this.findElement(resource, 'affiliation', ['datacite:creators.0.creator.0.affiliation.0']),
            publisher: this.findElement(resource, 'publisher', ['datacite:publisher.0']),

            version: this.findElement(resource, 'version', ['datacite:version.0']),
            creators: this.findElement(resource, 'creators', ['datacite:creators.0.creator']),
            rights: this.findElement(resource, 'rights', ['datacite:rightsList.0']),
            dates: this.findElement(resource, 'dates', ['datacite:dates.0']),

            aboutHarvestDate: oaiIdentifier,
            aboutBaseURL: '',
            aboutIdentifier: oaiIdentifier,
            aboutDatestamp: this.findElement(record, 'aboutDatestamp', ['header.0.datestamp.0']),
            aboutMetadataNamespace: 'oai_datacite',
//            subjects: resource['datacite:subjects'][0],
        };

        return data;
    }

}

export class Harvester {
    protected from: Date = null;
    protected uri: string;
    protected parser: DocumentBuilder;
    protected dao: MongoConnector;

    constructor(uri: string) {
        this.uri = uri;
        this.parser = new DocumentBuilder();
        this.dao = MongoConnector.getInstance();
    }

    public start() {
        const parser = this.parser;
        const dao = this.dao;
        const from = this.from;
        this.from = new Date(Date.now());

        let uri = this.uri;
        if (from !== null) {
            uri += '&from=' + from.toISOString();
        }

        logger.info('Send request: ' + uri);
        http.get(uri, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                parseString.parseString(data, {attrkey: '_$'}, function (err, result) {
                    if (err === undefined || err === null) {
                        try {
                            logger.info('Start processing...');
                            for (let record of result['OAI-PMH']['ListRecords']['0']['record']) {
                                let documentData = parser.extractData(record);
                                dao.putPublication(documentData).catch((err) => {
                                    if (err.name === 'MongoError' && err.code === 11000) {
                                        dao.getRecord(documentData).then((dataRecord) => {
                                            if (dataRecord !== undefined && !equal(dataRecord, documentData)) {
                                                dao.updatePublication(documentData);
                                            }
                                        });
                                    } else {
                                        logger.error(err);
                                    }
                                });
                            }
                        } catch (err) {
                            logger.error(err);
                        }
                    } else {
                        logger.error(err);
                    }
                });
            });
        }).on('error', (err) => {
            console.log('Error: ' + err.message);
        });
    }
}
