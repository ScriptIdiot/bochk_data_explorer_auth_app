const httpStatus = require('http-status');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');

/**
 * Get Neo4j connection configurations from config file
 * @param {Object} user user object
 * @returns {Object}
 */
const getNeo4jConnections = (user) => {
  if (!user || !user.sysRight) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized: Please login to UMS');
  }
  const { mappings } = config.bochkNeo4jConn;
  const newMappings = mappings.map((mapping) => ({
    ...mapping,
    regExp: RegExp(`^.*${mapping.key || ''}\\d+.*`),
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
  return neo4jConns;
};

module.exports = {
  getNeo4jConnections,
};
