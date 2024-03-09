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
        throw error; // Re-throw the error to be caught by the caller
  }
}

// async function outputXML(dbQuery) {
//   try {
//     const results = await runQuery(dbQuery);
//     const rowDataPacket = results[0] ?? {}; // Get the first RowDataPacket
//     const xmlObject = { results: rowDataPacket }; // Construct XML object with RowDataPacket
//     const xmlBuilder = new xml2js.Builder();
//     const xmlString = xmlBuilder.buildObject(xmlObject);
//     return xmlString;
//   } catch (error) {
//     throw error;
//   }
// }

async function outputXML(dbQuery) {
  try {
    const results = await runQuery(dbQuery);
    const xmlObject = { results: { result: results } }; // Create array of results to XML object
    const xmlBuilder = new xml2js.Builder();
    const xmlString = xmlBuilder.buildObject(xmlObject);
    return xmlString;
  } catch (error) {
    throw error;
  }
}


module.exports = { run, outputXML, outputJSON };
