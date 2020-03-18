import logger from "../../../server/logger";
import { ProviderDCMapper } from "../../core/core-oai-provider";
const humanname = require("humanname");

export class OpenaireMapper implements ProviderDCMapper {
  /**
   * The Universal Coordinated Time (UTC) date needs to be modifed
   * to match the local timezone.
   * @param record the raw data returned by the mongo dao query
   * @returns {string}
   */
  private setTimeZoneOffset(record: any): string {
    const date = new Date(record.updatedAt);
    const timeZoneCorrection = new Date(
      date.getTime() + date.getTimezoneOffset() * -60000
    );
    return timeZoneCorrection.toISOString().split(".")[0] + "Z";
  }

  private getRightsMessage(restricted: boolean): string {
    if (restricted) {
      return "Restricted to University users.";
    }
    return "Available to the public.";
  }

  private createItemRecord(record: any): any {
    //const updatedAt: string = this.setTimeZoneOffset(record);

    const formatDate = function(date) {
      let dd = date.getDate();
      let mm = date.getMonth() + 1;
      const yyyy = date.getFullYear();
      if (dd < 10) {
        dd = "0" + dd;
      }
      if (mm < 10) {
        mm = "0" + mm;
      }
      return `${yyyy}-${mm}-${dd}`;
    };

    let item = {
      record: [
        {
          header: [
            {
              identifier: [{ _attr: { identifierType: "doi" } }, record.pid]
            },
            { setSpec: "openaire_data" },
            { datestamp: formatDate(new Date()) }
          ]
        },
        {
          metadata: [
            {
              "datacite:resource": [
                {
                  _attr: {
                    "xmlns:rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
                    "xmlns:dcterms": "http://purl.org/dc/terms/",
                    "xmlns:datacite": "http://datacite.org/schema/kernel-4",
                    xmlns: "http://namespace.openaire.eu/schema/oaire/",
                    "xsi:schemaLocation":
                      "http://www.openarchives.org/OAI/2.0/oai_dc/ " +
                      "https://www.openaire.eu/schema/repo-lit/4.0/openaire.xsd"
                  }
                },
                // ......does it matter what these fields are called?
                {
                  "datacite:titles": [{ "datacite:title": record.title }]
                },
                {
                  "datacite:identifier": [
                    { _attr: { identifierType: "URL" } },
                    `https://doi.org/${record.pid}`
                  ]
                },
                record.dataDescription
                  ? {
                      "datacite:descriptions": [
                        {
                          description: [
                            { _attr: { descriptionType: "Abstract" } },
                            record.dataDescription
                          ]
                        }
                      ]
                    }
                  : {
                      /* ignore abstract if it doesn't exist */
                    },
                {
                  "datacite:dates": [
                    {
                      "datacite:date": [
                        { _attr: { dateType: "Issued" } },
                        formatDate(record.creationTime)
                      ]
                    },
                    record.availableTime
                      ? {
                          "datacite:date": [
                            { _attr: { dateType: "Available" } },
                            formatDate(record.availableTime)
                          ]
                        }
                      : {
                          /* ignore available time if it doesn't exist */
                        }
                  ]
                },
                { "datacite:publicationYear": record.publicationYear },
                {
                  "datacite:resourceType": [
                    { _attr: { resourceTypeGeneral: "Dataset" } },
                    "Dataset"
                  ]
                },
                {
                  "datacite:creators": record.creator.map(
                    (creator: string, index: number) => {
                      const parsed = humanname.parse(creator);
                      const reverse = parsed.lastName+", "+parsed.firstName;
                      return (
                        {
                          creator: [
                            {
                              creatorName: reverse
                            },
                            {
                              affiliation: record.affiliations
                                ? record.affiliations[index]
                                : record.affiliation
                            }
                          ]
                        })
                    }
                  )
                },
                { "datacite:publisher": record.publisher }, //category?/ source?
                { "datacite:version": 1 }, //category?/ source?
                {
                  "datacite:rightsList": [
                    {
                      "datacite:rights": [
                        {
                          _attr: {
                            rightsURI: "info:eu-repo/semantics/openAccess"
                          }
                        },
                        "OpenAccess"
                      ]
                    }
                  ]
                }
              ] //rights?
              // .....add more fields here
            }
          ]
        }
      ]
    };
    return item;
  }

  public mapOaiDcListRecords(records: any[]): any {
    const list = [];
    const response = {
      ListRecords: <any>[]
    };

    for (let record of records) {
      let item = this.createItemRecord(record);
      list.push(item);
    }

    logger.debug("Parsed " + list.length + " records into OAI xml format.");

    response.ListRecords = list;

    return response;
  }

  public mapOaiDcGetRecord(record: any): any {
    if (!record) {
      throw new Error("Record not found");
    }

    let item = this.createItemRecord(record);
    logger.debug("Got item with id " + record._id + ", title: " + record.title);
    return item;
  }

  public mapOaiDcListIdentifiers(records: any[]): any {
    const list = [];
    const response = {
      ListIdentifiers: <any>[]
    };

    for (let record of records) {
      const updatedAt: string = this.setTimeZoneOffset(record);
      let item = {
        record: [
          {
            header: [{ identifier: record.pid }, { datestamp: updatedAt }]
          }
        ]
      };

      list.push(item);
    }

    response.ListIdentifiers = list;

    return response;
  }

  public mapOaiDcListSets(records: any[]): any {
    const response = {
      ListSets: <any>[]
    };
    const list = [];
    let item = {
      set: [{ setName: "openaire_data" }, { setSpec: "openaire_data" }]
    };
    list.push(item);

    response.ListSets = list;
    return response;
  }
}
