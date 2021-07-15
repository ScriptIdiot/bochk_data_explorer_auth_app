const axios = require('axios');
const config = require('../config/config');
const logger = require('../config/logger');

/**
 * Get BOCHK UMS login URL
 * @returns {string}
 */
const getLoginURL = () => {
  const { loginURL, validateURL, sysCode, appId } = config.bochkUMS;
  const encodedValidateURL = encodeURIComponent(validateURL);
  const queries = `redirect=${encodedValidateURL}&syscode=${sysCode}&appid=${appId}`;
  return `${loginURL}?${queries}`;
};

/**
 * Get user information from BOCHK UMS
 * @param {Object} user - User object
 * @returns {Promise<string>}
 */
const getUserInfo = async (user) => {
  logger.info('Getting user information from BOCHK UMS');
  logger.debug(JSON.stringify(user));
  const { userInfoAPI, sysCode, appId } = config.bochkUMS;
  const queries = `syscode=${sysCode}&appid=${appId}&empnum=${user.empNum}&umssessionid=${user.umsSessionId}`;
  const resourceURL = `${userInfoAPI}?${queries}`;
  logger.debug(`Sending request to ${resourceURL}`);
  try {
    const response = await axios.get(resourceURL);
    return response.status === 200 ? response.data : '';
  } catch (e) {
    logger.error(e);
    return '';
  }
};

module.exports = {
  getLoginURL,
  getUserInfo,
};
