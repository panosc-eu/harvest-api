import { OaiPmh } from 'oai-pmh'
 
async function main () {
  const oaiPmh = new OaiPmh('http://export.arxiv.org/oai2')
  const identifierIterator = oaiPmh.listIdentifiers({
    metadataPrefix: 'oai_dc',
    from: '2015-01-01',
    until: '2015-01-04'
  })
  for await (const identifier of identifierIterator) {
    console.log(identifier)
  }
}
 
main().catch(console.error)
