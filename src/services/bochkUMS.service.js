const https = require('https');
const axios = require('axios');
const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const { userFactory } = require('../factories');
const executeChildProcess = require('../utils/executeChildProcess');

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
 * Decrypt empNum from BOCHK UMS response
 * @param {Object} parameters request parameters
 * @returns {Promise<Object>} user object
 */
const decryptEmpNum = async (parameters) => {
  logger.info(`Decrypt empNum from BOCHK UMS: ${JSON.stringify(parameters)}`);
  const { U: uFromParam, R: rFromParam, ID: idFromParam } = parameters;
  if (!uFromParam || !rFromParam || !idFromParam) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized: Please login to UMS');
  }
  const jarLocation = config.bochkUMS.decryptEmpNumJarLocation;
  const jarClassName = config.bochkUMS.decryptEmpNumJarClassName;
  const command = `java -cp ${jarLocation} ${jarClassName} ${uFromParam} ${rFromParam} D`;
  try {
    const empNum = await executeChildProcess(command);
    return {
      empNum,
      umsSessionId: idFromParam,
    };
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized: Please login to UMS');
  }
};

/**
 * Verify user credentials with BOCHK UMS
 * @param {Object} user - User object
 * @returns {Promise<string>}
 */
const verifyCredentials = async (user) => {
  logger.info(`Verify user credentials from BOCHK UMS: ${JSON.stringify(user)}`);
  const { domain, authCallbackURL, sysCode, appId } = config.bochkUMS;
  const queries = `syscode=${sysCode}&appid=${appId}&empnum=${user.empNum}&umssessionid=${user.umsSessionId}`;
  const resourceURL = `${domain}${authCallbackURL}?${queries}`;
  logger.debug(`Sending request to ${resourceURL}`);
  const agent = getHttpsAgent();
  const response = await axios.get(resourceURL, { httpsAgent: agent });
  if (response.status === 200 && response.data !== null) {
    logger.debug(`Retrieved response: ${JSON.stringify(response.data)}`);
    const userInfo = userFactory.fromBOCHKUMSVerifyCredentialsAPI(response.data);
    if (userInfo.isSuccess) {
      const { sysRight } = userInfo;
      const { allowedAccessSysRights } = config.bochkUMS;
      const rights = sysRight.split(',');
      logger.debug(JSON.stringify(rights));
      const targetSysRightRegExpList = allowedAccessSysRights.map((allowedSysRight) =>
        RegExp(`^.*${allowedSysRight}\\d+.*`)
      );
      const checkSysRightResults = rights.map((right) => {
        for (let i = 0; i < targetSysRightRegExpList.length; i += 1) {
          if (targetSysRightRegExpList[i].test(right)) {
            return 1;
          }
        }
        return 0;
      });
      if (checkSysRightResults.includes(1)) {
        return {
          ...user,
          ...userInfo,
        };
      }
      throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden: No access right');
    } else {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized: Please login to UMS');
    }
  } else {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden: No access right');
  }
};

module.exports = {
  getLoginURL,
  decryptEmpNum,
  verifyCredentials,
};
