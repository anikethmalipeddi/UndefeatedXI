const sources = [
  'https://github.com/openfootball/players',
  'https://github.com/openfootball/football.json',
  'https://www.wikidata.org/wiki/Wikidata:SPARQL_query_service/en-gb',
  'https://www.football-data.co.uk/data',
  'https://github.com/statsbomb/open-data',
]

for (const url of sources) {
  const response = await fetch(url, { method: 'HEAD' }).catch(() => null)
  const status = response ? response.status : 'unreachable'
  console.log(`${status} ${url}`)
}
