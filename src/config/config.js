const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');
const tryParseJSON = require('../utils/tryParseJSON');
const getJSONFileContent = require('../utils/getJSONFileContent');

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
    BOCHK_UMS_DOMAIN: Joi.string().required().description('BOCHK UMS domain'),
    BOCHK_UMS_LOGIN_URL: Joi.string().required().description('BOCHK UMS login URL'),
    BOCHK_UMS_DECRYPT_EMPNUM_JAR_LOCATION: Joi.string().required().description('used for decrypt the empnum'),
    BOCHK_UMS_DECRYPT_EMPNUM_JAR_CLASS_NAME: Joi.string()
      .required()
      .description('call class from jar to decrypt the empnum'),
    BOCHK_UMS_AUTH_CALLBACK_URL: Joi.string().required().description('BOCHK UMS auth callback URL'),
    BOCHK_UMS_SYSCODE: Joi.string().required().description('system code of BOCHK UMS'),
    BOCHK_UMS_APP_ID: Joi.string().required().description('application ID of BOCHK UMS'),
    BOCHK_UMS_ALLOWED_ACCESS_SYSRIGHTS: Joi.string().required().description('sysrights that allowed to access'),
    BOCHK_UMS_SHOULD_SIMULATE_UMS_APP: Joi.boolean().description('should enable simulation of UMS or not').default(false),
    BOCHK_UMS_SHOULD_DECRYPT_EMP_NUM_WITH_JAR: Joi.boolean()
      .description('should decrypt employee number with jar file or not')
      .default(false),
    BOCHK_NEO4J_SYSRIGHT_MAPPING_FILEPATH_ARRAY: Joi.string().required().description('SysRight JSON config filepath array'),
    BOCHK_CYPHER_SAMPLE_QUERIES_MAPPING_FILEPATH_ARRAY: Joi.string()
      .required()
      .description('user group and cypher queries JSON config filepath array'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  isDev: envVars.NODE_ENV === 'development',
  isProd: envVars.NODE_ENV === 'production',
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
    domain: envVars.BOCHK_UMS_DOMAIN,
    loginURL: envVars.BOCHK_UMS_LOGIN_URL,
    authCallbackURL: envVars.BOCHK_UMS_AUTH_CALLBACK_URL,
    sysCode: envVars.BOCHK_UMS_SYSCODE,
    appId: envVars.BOCHK_UMS_APP_ID,
    decryptEmpNumJarLocation: envVars.BOCHK_UMS_DECRYPT_EMPNUM_JAR_LOCATION,
    decryptEmpNumJarClassName: envVars.BOCHK_UMS_DECRYPT_EMPNUM_JAR_CLASS_NAME,
    allowedAccessSysRights: tryParseJSON(envVars.BOCHK_UMS_ALLOWED_ACCESS_SYSRIGHTS, []),
    shouldEnableSimulationOfUMS: envVars.BOCHK_UMS_SHOULD_SIMULATE_UMS_APP,
    shouldDecryptEmpNumWithJar: envVars.BOCHK_UMS_SHOULD_DECRYPT_EMP_NUM_WITH_JAR,
  },
  bochkNeo4jConn: {
    mappings: tryParseJSON(envVars.BOCHK_NEO4J_SYSRIGHT_MAPPING_FILEPATH_ARRAY, [])
      .map((filepath) => {
        return getJSONFileContent(filepath, []);
      })
      .reduce((accumulator, current) => {
        if (Array.isArray(current)) {
          return accumulator.concat(current);
        }
        return accumulator;
      }, []),
  },
  bochkDataExplorer: {
    cypherSampleQueriesMappings: tryParseJSON(envVars.BOCHK_CYPHER_SAMPLE_QUERIES_MAPPING_FILEPATH_ARRAY, [])
      .map((filePath) => {
        return getJSONFileContent(filePath, []);
      })
      .reduce((accumulator, current) => {
        if (Array.isArray(current)) {
          return accumulator.concat(current);
        }
        return accumulator;
      }, []),
  },
};
