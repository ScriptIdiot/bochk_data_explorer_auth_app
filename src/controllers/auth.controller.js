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
  logger.debug(JSON.stringify(req.body));
  const userBody = userFactory.fromBOCHKUMSValidateCallback(req.body);
  const user = { ...userBody };
  const userInfoString = await bochkUMSService.getUserInfo(user);
  const userInfoData = userFactory.fromBOCHKUMSUserInfoAPI(userInfoString);
  Object.assign(user, userInfoData);
  const tokens = await tokenService.generateAuthTokens(user);
  res.cookie('accessToken', tokens.access.token, config.cookie.options);
  res.cookie('accessTokenExpiry', tokens.access.expires, config.cookie.options);
  res.cookie('refreshToken', tokens.refresh.token, config.cookie.options);
  res.cookie('refreshTokenExpiry', tokens.refresh.expires, config.cookie.options);
  res.redirect('/');
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
  login,
  logout,
  refreshTokens,
};
