const fs = require('fs');
const csv = require('csv-parser');

exports.parseCSV = (filePath, callback) => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', callback)
      .on('end', resolve)
      .on('error', reject);
  });
};
