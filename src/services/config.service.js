const config = require('../config/config');

/**
 * Get Neo4j connection configurations from config file
 * @returns {Object}
 */
const getNeo4jConfig = () => {
  return config.neo4j;
};

module.exports = {
  getNeo4jConfig,
};
