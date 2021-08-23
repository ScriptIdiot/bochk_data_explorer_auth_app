/**
 * Convert BOCHK UMS validate callback request payload to our standard
 * @param {Object} requestPayload - request payload
 * @returns {Object}
 */
const fromBOCHKUMSValidateCallback = (requestPayload) => {
  const { empnum: userId, umssessionid: sessionId } = requestPayload;
  return {
    empNum: userId,
    umsSessionId: sessionId,
  };
};

/**
 * Convert BOCHK UMS verify credentials API response to our standard
 * @param {string} responseData - user info
 * @returns {Object}
 */
const fromBOCHKUMSVerifyCredentialsAPI = (responseData) => {
  const userInfoArray = responseData.split(';');
  if (userInfoArray && userInfoArray.length === 8) {
    const authStatus = userInfoArray[0].split('=')[1];
    const empNum = userInfoArray[1].split('=')[1];
    const userFullName = userInfoArray[2].split('=')[1];
    const bankCode = userInfoArray[3].split('=')[1];
    const deptCode = userInfoArray[4].split('=')[1];
    const divCode = userInfoArray[5].split('=')[1];
    const brCode = userInfoArray[6].split('=')[1];
    const sysRight = userInfoArray[7].split('=')[1].replace('\n', '');
    return {
      isSuccess: authStatus.toUpperCase() === 'SUCCESS',
      authStatus,
      empNum,
      userFullName,
      bankCode,
      deptCode,
      divCode,
      brCode,
      sysRight,
      role: 'user',
    };
  }
  return {};
};

module.exports = {
  fromBOCHKUMSValidateCallback,
  fromBOCHKUMSVerifyCredentialsAPI,
};
