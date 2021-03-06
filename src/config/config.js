const Joi = require('joi');
const path = require('path');
const dotenv = require('dotenv');
const CryptoJS = require('crypto-js');
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
    BOCHK_UMS_ALLOWED_TO_ACCESS_NEO4J_EXPLORER_SYSRIGHTS: Joi.string()
      .required()
      .description('sysrights that allowed to access the Neo4j explorer'),
    BOCHK_UMS_SHOULD_SIMULATE_UMS_APP: Joi.boolean().description('should enable simulation of UMS or not').default(false),
    BOCHK_UMS_SHOULD_DECRYPT_EMP_NUM_WITH_JAR: Joi.boolean()
      .description('should decrypt employee number with jar file or not')
      .default(false),
    BOCHK_NEO4J_SYSRIGHT_MAPPING_FILEPATH_ARRAY: Joi.string().required().description('SysRight JSON config filepath array'),
    BOCHK_CYPHER_SAMPLE_QUERIES_LIMITATION: Joi.number().description('the search limit for sample queries').default(300),
    BOCHK_CYPHER_SAMPLE_QUERIES_MAPPING_FILEPATH_ARRAY: Joi.string()
      .required()
      .description('user group and cypher queries JSON config filepath array'),
    BOCHK_GRAPH2CSV_OUTPUT_FILE_TYPE: Joi.string().description('the export file type').default('csv'),
    BOCHK_GRAPH2CSV_IS_UUID: Joi.string().default('Y').description('to generate a random UUID as a filename'),
    BOCHK_GRAPH2CSV_OUTPUT_FOLDER_PATH: Joi.string().required().description('the export csv folder path'),
    BOCHK_GRAPH2CSV_JAR_LOCATION: Joi.string()
      .required()
      .description('used for transform the graphML content as a CSV file'),
    BOCHK_NEO4J_BROWSER_REDIRECT_URL: Joi.string().required().description('used for redirect to the Neo4j browser'),
    BOCHK_NEO4J_BROWSER_DATABASE_HOST_MAPPING_ARRAY: Joi.string()
      .required()
      .description('user group and Neo4j host name config filepath array'),
    BOCHK_NEO4J_BROWSER_ADMIN_USER_GROUP_SYSRIGHTS: Joi.string()
      .required()
      .description('sysrights that allowed to access the Neo4j browser with admin role permissions'),
    BOCHK_NEO4J_BROWSER_READER_USER_GROUP_SYSRIGHTS: Joi.string()
      .required()
      .description('sysrights that allowed to access the Neo4j browser with reader role permissions'),
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
    allowedAccessNeo4JExplorerSysRights: tryParseJSON(envVars.BOCHK_UMS_ALLOWED_TO_ACCESS_NEO4J_EXPLORER_SYSRIGHTS, []),
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
      }, [])
      .map((mapping) => {
        if (mapping.neo4jConn.password) {
          return Object.assign(mapping, {
            neo4jConn: {
              ...mapping.neo4jConn,
              password: CryptoJS.AES.encrypt(
                Buffer.from(mapping.neo4jConn.password, 'base64').toString('utf-8'),
                'bochk_ngp'
              ).toString(),
            },
          });
        }
        return mapping;
      }),
  },
  bochkDataExplorer: {
    cypherSampleQueriesLimit: envVars.BOCHK_CYPHER_SAMPLE_QUERIES_LIMITATION,
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
    exportGraphMLFileType: envVars.BOCHK_GRAPH2CSV_OUTPUT_FILE_TYPE,
    exportGraphMLUseUUIDAsFilename: envVars.BOCHK_GRAPH2CSV_IS_UUID,
    exportGraphMLFolderPath: envVars.BOCHK_GRAPH2CSV_OUTPUT_FOLDER_PATH,
    convertGraphML2CSVJarLocation: envVars.BOCHK_GRAPH2CSV_JAR_LOCATION,
  },
  bochkNeo4jBrowser: {
    url: envVars.BOCHK_NEO4J_BROWSER_REDIRECT_URL,
    userGroupDBHostMappings: tryParseJSON(envVars.BOCHK_NEO4J_BROWSER_DATABASE_HOST_MAPPING_ARRAY, [])
      .map((filePath) => {
        return getJSONFileContent(filePath, []);
      })
      .reduce((accumulator, current) => {
        if (Array.isArray(current)) {
          return accumulator.concat(current);
        }
        return accumulator;
      }, []),
    accessWithAdminRoleSysRights: tryParseJSON(envVars.BOCHK_NEO4J_BROWSER_ADMIN_USER_GROUP_SYSRIGHTS, []),
    accessWithReaderRoleSysRights: tryParseJSON(envVars.BOCHK_NEO4J_BROWSER_READER_USER_GROUP_SYSRIGHTS, []),
  },
};
