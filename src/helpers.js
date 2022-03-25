/* eslint-disable linebreak-style */
/**
 * Replaces underscores with spaces, makes first letter uppercase.
 *
 * @param {String} name Name to normalize.
 * @returns {String} Normalized name.
 */
export const normalizeName = (name) => {
  const output = name.replace(/_/g, ' ');

  return output.charAt(0).toUpperCase() + output.slice(1);
};

/**
 * Limits a number to be in [min, max] range.
 *
 * @param {Number} value Value to clamp.
 * @param {Number} min   Minimum value.
 * @param {Number} max   Maximum value.
 * @returns {Number}     Clamped value.
 */
export const clamp = (value, min, max) => {
  if (value <= min) return min;
  if (value >= max) return max;
  return value;
};

/**
 * Returns a random ID.
 *
 * @returns {String} Random ID.
 */
export const getRandomId = () => Math.random()
  .toString(36)
  .replace(/[^a-z]+/g, '')
  .substr(2, 10);

/**
 * Returns a random ID.
 *
 * @param {Number} ms   Number of milisecond to sleep.
 * @returns {Promise} Awaitable promise that will be resolved in the selected time.
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
