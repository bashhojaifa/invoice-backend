const httpStatus = require('../constants/httpStatus');
const ApiError = require('./ApiError');

const usedCodesByLength = new Map();

/**
 * Generate a unique numeric code of given length
 * @param {number} length - Desired number of digits (1 to 15)
 * @returns {number} - Unique numeric code
 * @throws {ApiError} - If all codes are exhausted or input is invalid
 */
function generateUniqueCode(length) {
  if (length < 1 || length > 15) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Length must be between 1 and 15 digits.');
  }

  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const rangeSize = max - min + 1;

  if (!usedCodesByLength.has(length)) {
    usedCodesByLength.set(length, new Set());
  }

  const usedCodes = usedCodesByLength.get(length);

  if (usedCodes.size >= rangeSize) {
    throw new ApiError(httpStatus.BAD_GATEWAY, `All ${length}-digit codes have been used.`);
  }

  let code;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    code = Math.floor(min + Math.random() * rangeSize);
    attempts++;
  } while (usedCodes.has(code) && attempts < maxAttempts);

  if (usedCodes.has(code)) {
    throw new ApiError(
      httpStatus.BAD_GATEWAY,
      `Failed to generate unique ${length}-digit code after ${maxAttempts} attempts.`,
    );
  }

  usedCodes.add(code);
  return code;
}

module.exports = { generateUniqueCode };
