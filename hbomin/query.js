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

async function outputJSON(dbQuery) {
  try {
    const results = await runQuery(dbQuery);
    return results;
  } catch (error) {
    console.error('Fout bij het uitvoeren van de query: ', error);
    throw error; // Re-throw the error to be caught by the caller
  }
}

function outputXML(dbQuery) {
  return new Promise((resolve, reject) => {
    runQuery(dbQuery)
      .then((results) => {
        resolve(xml({ results: results[0] }));
      })
      .catch((error) => {
        console.error('Fout bij het uitvoeren van de query: ', error);
        reject(error);
      });
  });
}

module.exports = { outputXML, outputJSON };
