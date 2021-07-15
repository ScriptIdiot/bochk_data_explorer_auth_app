/**
 * Convert BOCHK UMS validate callback request body to our standard
 * @param {Object} reqBody - request body
 * @returns {Object}
 */
const fromBOCHKUMSValidateCallback = (reqBody) => {
  const { userId, sessionId } = reqBody;
  return {
    empNum: userId,
    umsSessionId: sessionId,
  };
};

/**
 * Convert BOCHK UMS user info API response to our standard
 * @param {string} userInfo - user info
 * @returns {Object}
 */
const fromBOCHKUMSUserInfoAPI = (userInfo) => {
  const userInfoArray = userInfo.split(';');
  if (userInfoArray && userInfoArray.length === 8) {
    const authStatus = userInfoArray[0].split('=')[1];
    const empNum = userInfoArray[1].split('=')[1];
    const bankCode = userInfoArray[2].split('=')[1];
    const deptCode = userInfoArray[3].split('=')[1];
    const divCode = userInfoArray[4].split('=')[1];
    const brCode = userInfoArray[5].split('=')[1];
    const sysRight = userInfoArray[6].split('=')[1];
    return {
      isSuccess: authStatus.toUpperCase() === 'SUCCESS',
      authStatus,
      empNum,
      bankCode,
      deptCode,
      divCode,
      brCode,
      sysRight,
    };
  }
  return {};
};

module.exports = {
  fromBOCHKUMSValidateCallback,
  fromBOCHKUMSUserInfoAPI,
};
