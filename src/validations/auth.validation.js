const Joi = require('joi');
const { password } = require('./custom.validation');

const validateGetRequest = {
  query: Joi.object().keys({
    empnum: Joi.string(),
    umssessionid: Joi.string(),
    U: Joi.string(),
    R: Joi.string(),
    ID: Joi.string(),
  }),
};

const validatePostRequest = {
  body: Joi.object().keys({
    userId: Joi.string(),
    sessionId: Joi.string(),
    U: Joi.string(),
    R: Joi.string(),
    ID: Joi.string(),
  }),
};

const validateNeo4jBrowserAuthRequest = {
  body: Joi.object().keys({
    username: Joi.string(),
    password: Joi.string(),
  }),
};

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

module.exports = {
  validateGetRequest,
  validatePostRequest,
  validateNeo4jBrowserAuthRequest,
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
