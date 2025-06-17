const config = require('../config/config');
const logger = require('../utils/logger');
// const { networkInterfaces } = require("os");

function getIpFormat(req) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
  return `${ip} - `;
}

function getDeviceType(req) {
  const userAgent = req.headers['user-agent'] || '';
  if (/mobile/i.test(userAgent)) return 'Mobile App';
  if (/iPad|Android|Touch/i.test(userAgent)) return 'Tablet';
  return 'Web Browser';
}

// function getMacAddress() {
//   const nets = networkInterfaces();
//   for (const name of Object.keys(nets)) {
//     for (const net of nets[name]) {
//       if (net.mac && net.mac !== "00:00:00:00:00:00") {
//         return net.mac;
//       }
//     }
//   }
//   return "Unknown MAC";
// }

function logRequest(req, res, next) {
  const startTime = process.hrtime();
  // const macAddress = getMacAddress();
  const deviceType = getDeviceType(req);

  res.on('finish', () => {
    const elapsedTime = getElapsedTime(startTime);
    const status = res.statusCode;
    const message = res.locals.errorMessage || '';
    const ipFormat = getIpFormat(req);

    const logMessage = `${ipFormat}${req.method} ${req.originalUrl} ${status} - ${elapsedTime} ms - Device: ${deviceType}`;

    if (status < 400) {
      logger.info(logMessage);
    } else {
      logger.error(`${logMessage} - message: ${message}`);
    }
  });

  next();
}

function getElapsedTime(startTime) {
  const diff = process.hrtime(startTime);
  return (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3); // Convert to milliseconds
}

module.exports = logRequest;
