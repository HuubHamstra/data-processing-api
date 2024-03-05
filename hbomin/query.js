var connection = require('./database');
const xml2js = require('xml2js');

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

async function run(dbQuery, isJSON = true) {
  if (isJSON) {
    return await outputJSON(dbQuery);
  }
  else {
    return await outputXML(dbQuery);
  }
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


async function outputXML(dbQuery) {
  try {
    const results = await runQuery(dbQuery);
    const xmlBuilder = new xml2js.Builder();
    const xmlString = xmlBuilder.buildObject({ results: results });
    return xmlString;
  } catch (error) {
    console.error('Fout bij het uitvoeren van de query: ', error);
    throw error; // Re-throw the error to be caught by the caller
  }
}


module.exports = { run, outputXML, outputJSON };
