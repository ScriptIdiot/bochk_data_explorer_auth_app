const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    BOCHK_UMS_LOGIN_URL: Joi.string().required().description('BOCHK UMS login URL'),
    BOCHK_UMS_USER_INFO_API_URL: Joi.string().required().description('BOCHK UMS user information API URL'),
    BOCHK_UMS_VALIDATE_AUTHENTICATION_CALLBACK_URL: Joi.string()
      .required()
      .description('application validate authentication callback URL'),
    BOCHK_UMS_SYSCODE: Joi.string().required().description('system code of BOCHK UMS'),
    BOCHK_UMS_APP_ID: Joi.string().required().description('application ID of BOCHK UMS'),
    NEO4J_URL: Joi.string().required().description('neo4j server uri'),
    NEO4J_USER: Joi.string().required().description('neo4j username'),
    NEO4J_PASSWORD: Joi.string().required().description('neo4j password'),
    NEO4J_DATABASE: Joi.string().required().description('neo4j database'),
    NEO4J_SAVE_PASSWORD: Joi.boolean().default(false).description('neo4j save password'),
    NEO4J_USE_ENCRYPTION: Joi.boolean().default(false).description('neo4j use encryption'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  cookie: {
    options: {
      maxAge: 1000 * 60 * 120,
      httpOnly: false,
      signed: false,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  bochkUMS: {
    loginURL: envVars.BOCHK_UMS_LOGIN_URL,
    userInfoAPI: envVars.BOCHK_UMS_USER_INFO_API_URL,
    validateURL: envVars.BOCHK_UMS_VALIDATE_AUTHENTICATION_CALLBACK_URL,
    sysCode: envVars.BOCHK_UMS_SYSCODE,
    appId: envVars.BOCHK_UMS_APP_ID,
  },
  neo4j: {
    url: envVars.NEO4J_URL,
    user: envVars.NEO4J_USER,
    password: envVars.NEO4J_PASSWORD,
    database: envVars.NEO4J_DATABASE,
    savePassword: envVars.NEO4J_SAVE_PASSWORD,
    useEncryption: envVars.NEO4J_USE_ENCRYPTION,
  },
};
