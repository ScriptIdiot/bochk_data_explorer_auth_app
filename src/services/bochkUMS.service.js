const https = require('https');
const axios = require('axios');
const config = require('../config/config');
const logger = require('../config/logger');

const getHttpsAgent = () => https.Agent({ rejectUnauthorized: false });

/**
 * Get BOCHK UMS login URL
 * @returns {string}
 */
const getLoginURL = () => {
  const { domain, loginURL } = config.bochkUMS;
  return `${domain}${loginURL}`;
};

/**
 * Get user information from BOCHK UMS
 * @param {Object} user - User object
 * @returns {Promise<string>}
 */
const getUserInfo = async (user) => {
  logger.info('Getting user information from BOCHK UMS');
  logger.debug(JSON.stringify(user));
  const { domain, authCallbackURL, sysCode, appId } = config.bochkUMS;
  const queries = `syscode=${sysCode}&appid=${appId}&empnum=${user.empNum}&umssessionid=${user.umsSessionId}`;
  const resourceURL = `${domain}${authCallbackURL}?${queries}`;
  logger.debug(`Sending request to ${resourceURL}`);
  try {
    const agent = getHttpsAgent();
    const response = await axios.get(resourceURL, { httpsAgent: agent });
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
