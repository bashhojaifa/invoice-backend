/**
 * Parse date string to MySQL YYYY-MM-DD format
 */
exports.parseDate = dateString => {
  const date = new Date(dateString);
  if (isNaN(date)) throw new Error(`Invalid date: ${dateString}`);
  return date.toISOString().split('T')[0];
};
