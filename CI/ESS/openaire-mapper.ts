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
              identifier: [
                { _attr: { identifierType: "doi" } },
                record._id.toString()
              ]
            },
            { datestamp: formatDate(new Date()) },
            { setSpec: "openaire_data" }
          ]
        },
        {
          metadata: [
            {
              oai_datacite: [
                {
                  _attr: {
                    xmlns: "http://schema.datacite.org/oai/oai-1.0/",
                    "xsi:schemaLocation":
                      "http://schema.datacite.org/oai/oai-1.0/ oai_datacite.xsd"
                  }
                },
                { schemaVersion: 3.1 },
                { datacentreSymbol: "SCICAT.ESS" },
                {
                  payload: [
                    {
                      "datacite:resource": [
                        {
                          _attr: {
                            "xmlns:datacite":
                              "http://datacite.org/schema/kernel-3",
                            "xsi:schemaLocation":
                              "http://datacite.org/schema/kernel-3" +
                              "http://schema.datacite.org/meta/kernel-3/metadata.xsd"
                          }
                        },
                        {
                          "datacite:titles": [
                            { "datacite:title": record.title }
                          ]
                        },
                        {
                          "datacite:identifier": [
                            { _attr: { identifierType: "URL" } },
                            `https://doi.org/${record._id.toString()}`
                          ]
                        },
                        record.dataDescription
                          ? {
                              "datacite:descriptions": [
                                {
                                  "datacite:description": [
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
                            record.creationTime
                            ? {
                              "datacite:date": [
                                { _attr: { dateType: "Issued" } },
                                formatDate(record.creationTime)
                              ]
                            }
                            : {
                              "datacite:date": [
                                { _attr: { dateType: "Issued" } },
                                formatDate(new Date(`${record.publicationYear}-01-01`))
                                /* use publicationYear if creationTime doesn't exist */
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
                              const reverse =
                                parsed.lastName + ", " + parsed.firstName;
                              return {
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
                              };
                            }
                          )
                        },
                        { "datacite:publisher": record.publisher }, //category?/ source?
                        { "datacite:version": 1 }, //category?/ source?
                        {
                          "datacite:subjects": [
                            {
                              "datacite:subject": "Photon and neutron data"
                            }
                          ]
                        },
                        {
                          "datacite:rightsList": [
                            {
                              "datacite:rights": [
                                {
                                  _attr: {
                                    rightsURI:
                                      "info:eu-repo/semantics/openAccess"
                                  }
                                },
                                "OpenAccess"
                              ]
                            }
                          ]
                        }
                      ] //rights?
                    }
                  ]
                }
              ]
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
            header: [{ identifier: record._id.toString() }, { datestamp: updatedAt }]
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
