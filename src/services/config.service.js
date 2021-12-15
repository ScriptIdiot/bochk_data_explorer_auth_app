const httpStatus = require('http-status');
const CryptoJS = require('crypto-js');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');

/**
 * Get Neo4j connection configurations from config file
 * @param {Object} user user object
 * @returns {Array}
 */
const getNeo4jConnections = (user) => {
  if (!user || !user.sysRight) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized: Please login to UMS');
  }
  const { mappings } = config.bochkNeo4jConn;
  const newMappings = mappings.map((mapping) => ({
    ...mapping,
    regExp: RegExp(`^.*${mapping.key || ''}+.*`),
  }));
  const neo4jConns = user.sysRight
    .split(',')
    .map((right) => {
      const connections = [];
      for (let i = 0; i < newMappings.length; i += 1) {
        const mapping = newMappings[i];
        if (mapping.regExp.test(right)) {
          connections.push(mapping.neo4jConn);
        }
      }
      return connections;
    })
    .filter((connections) => connections.length > 0)
    .reduce((accumulator, current) => accumulator.concat(current), []);
  return CryptoJS.AES.encrypt(JSON.stringify(neo4jConns), user.umsSessionId).toString();
};

/**
 * Get Neo4j browser configurations from config file
 * @param {Object} user user object
 * @returns {Object}
 */
const getNeo4jBrowserConfigurations = (user) => {
  if (!user || !user.sysRight) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized: Please login to UMS');
  }
  const { url, userGroupDBHostMappings } = config.bochkNeo4jBrowser;
  const newMappings = userGroupDBHostMappings.map((mapping) => ({
    ...mapping,
    regExp: RegExp(`^.*${mapping.key || ''}+.*`),
  }));
  const neo4jBrowserConfigurations = {
    url,
    host: 'neo4j://localhost:7687',
  };
  user.sysRight.split(',').forEach((right) => {
    for (let i = 0; i < newMappings.length; i += 1) {
      const mapping = newMappings[i];
      if (mapping.regExp.test(right)) {
        neo4jBrowserConfigurations.host = mapping.host;
        return neo4jBrowserConfigurations;
      }
    }
  });
  return neo4jBrowserConfigurations;
};

/**
 * Get Data Explorer sample cypher queries from config file
 * @param {Object} user user object
 * @returns {Array}
 */
const getCypherSampleQueries = (user) => {
  if (!user || !user.sysRight) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized: Please login to UMS');
  }
  const { cypherSampleQueriesLimit: limit, cypherSampleQueriesMappings: mappings } = config.bochkDataExplorer;
  const newMappings = mappings.map((mapping) => ({
    ...mapping,
    regExp: RegExp(`^.*${mapping.key || ''}.*`),
  }));
  const _appendLimitToQuery = (query) => {
    if (query.toLowerCase().indexOf('limit') !== -1) {
      return query;
    }
    if (query.lastIndexOf(';') === query.length - 1) {
      return `${query.substring(0, query.length - 2)}\nLIMIT ${limit};`;
    }
    return `${query}\nLIMIT ${limit}`;
  };
  const sampleCypherQueries = user.sysRight
    .split(',')
    .map((right) => {
      let connections = [];
      for (let i = 0; i < newMappings.length; i += 1) {
        const mapping = newMappings[i];
        if (mapping.regExp.test(right)) {
          connections = connections.concat(mapping.sampleQueries);
        }
      }
      return connections;
    })
    .reduce((accumulator, current) => accumulator.concat(current), [])
    .map((query, i) => ({
      text: query.header || `Sample Query Header hasn't specified at index: ${i}`,
      value: i,
      code: query.query ? _appendLimitToQuery(query.query) : `Sample Query Content hasn't specified at index: ${i}`,
    }));
  return sampleCypherQueries;
};

module.exports = {
  getNeo4jConnections,
  getNeo4jBrowserConfigurations,
  getCypherSampleQueries,
};
