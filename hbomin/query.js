var connection = require('./database');
var xml = require('xml');

function runQuery(dbQuery) {
  return new Promise((resolve, reject) => {
    connection.query(dbQuery, (error, results) => {
      if (error) {
        reject(error); // Reject the promise with the error
      } else {
        resolve(results); // Resolve the promise with the results
      }
    });
  });
}

async function outputJSON(dbQuery, router) {
  try {
    const results = await runQuery(dbQuery);
    router.get('/', (req, res) => {
      res.json({ results: results[0] });
    });
    return results;
  } catch (error) {
    console.error('Fout bij het uitvoeren van de query: ', error);
    router.get('/', (req, res) => {
      res.status(500).json({ error: 'An error occurred' });
    });
  }
}


function outputXML(dbQuery, router) {
  runQuery(dbQuery, function(results, error) {
    router.get('/', function(req, res) {
      res.set('Content-Type', 'text/xml');
      if (error) {
        console.error('Fout bij het uitvoeren van de query: ', error);
        res.status(500).send(xml({ error: 'An error occurred' })); // Sending error as XML response
      } else {
        res.send(xml({ results:results[0] })); // Sending results as XML response
      }
    });
  });
};

module.exports = {outputXML, outputJSON};