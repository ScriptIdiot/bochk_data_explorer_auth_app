const { v4: uuid4 } = require('uuid');
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');
const logger = require('../config/logger');
const { userFactory } = require('../factories');
const { authService, tokenService, bochkUMSService } = require('../services');

const getBOCHKUMSLoginUrl = (req, res) => {
  const url = bochkUMSService.getLoginURL();
  res.send(url);
};

const validate = catchAsync(async (req, res) => {
  const requestPayload = {
    ...req.body,
    ...req.query,
  };
  logger.debug(JSON.stringify(requestPayload));
  const userBody = userFactory.fromBOCHKUMSValidateCallback(requestPayload);
  let user = { ...userBody };
  if (config.isDev || config.bochkUMS.shouldEnableSimulationOfUMS) {
    logger.debug(JSON.stringify(req.query));
    const userQuery = userFactory.fromBOCHKUMSValidateCallback(req.query);
    user = {
      ...userBody,
      ...userQuery,
    };
  }
  if (config.bochkUMS.shouldDecryptEmpNumWithJar && !user.empNum) {
    const decryptedUser = await bochkUMSService.decryptEmpNum(requestPayload);
    user = {
      ...user,
      ...decryptedUser,
    };
  }
  user = await bochkUMSService.verifyCredentials(user);
  if (!user.umsSessionId || user.umsSessionId === null || user.umsSessionId === '') {
    user.umsSessionId = uuid4();
  }
  logger.debug(JSON.stringify(user));
  const tokens = await tokenService.generateAuthTokens(user);
  res.cookie('hasAccessNeo4jBrowserRight', user.hasAccessNeo4jBrowserRight);
  res.cookie('empNum', user.empNum);
  res.cookie('umsSessionId', user.umsSessionId);
  res.cookie('accessToken', tokens.access.token, config.cookie.options);
  res.cookie('accessTokenExpiry', tokens.access.expires, config.cookie.options);
  res.cookie('refreshToken', tokens.refresh.token, config.cookie.options);
  res.cookie('refreshTokenExpiry', tokens.refresh.expires, config.cookie.options);
  res.redirect('/');
});

const validateNeo4jBrowserAuthRequest = catchAsync(async (req, res) => {
  const requestPayload = req.body;
  logger.info('Handling request for validating access right of the Neo4j browser for user');
  logger.debug(JSON.stringify(requestPayload));
  const userBody = userFactory.fromNeo4jAuthPluginValidateRequest(requestPayload);
  let user = { ...userBody };
  user = await bochkUMSService.verifyCredentials(user);
  if (!user.umsSessionId || user.umsSessionId === null || user.umsSessionId === '') {
    user.umsSessionId = uuid4();
  }
  logger.debug(JSON.stringify(user));
  const _fromBOCUMSVerificationResult = (userObject) => {
    const { hasAccessNeo4jBrowserRight, hasAdminRolePermissionsRight, hasReaderRolePermissionsRight } = userObject;
    const responseObject = {
      isAuthenticated: false,
      userGroup: null,
    };
    if (hasAccessNeo4jBrowserRight && hasAccessNeo4jBrowserRight === 1) {
      responseObject.isAuthenticated = true;
      if (hasAdminRolePermissionsRight && hasAdminRolePermissionsRight === 1) {
        responseObject.userGroup = 'admin';
      } else if (hasReaderRolePermissionsRight && hasReaderRolePermissionsRight === 1) {
        responseObject.userGroup = 'reader';
      }
      return responseObject;
    }
    return responseObject;
  };
  const responseBody = _fromBOCUMSVerificationResult(user);
  logger.debug(JSON.stringify(responseBody));
  res.send(responseBody);
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

module.exports = {
  getBOCHKUMSLoginUrl,
  validate,
  validateNeo4jBrowserAuthRequest,
  login,
  logout,
  refreshTokens,
};
