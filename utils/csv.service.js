const createCsvWriter = require('csv-writer').createObjectCsvStringifier;

function toCSV(records) {
  if (!records.length) return '';
  const header = Object.keys(records[0]).map((key) => ({ id: key, title: key }));
  const csvWriter = createCsvWriter({ header });
  return csvWriter.getHeaderString() + csvWriter.stringifyRecords(records);
}
module.exports = { toCSV }; 