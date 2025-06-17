const fs = require('fs');
const { StreamArray } = require('stream-json/streamers/StreamArray');

exports.parseJSON = (filePath, callback) => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(StreamArray.withParser())
      .on('data', ({ value }) => callback(value))
      .on('end', resolve)
      .on('error', reject);
  });
};
