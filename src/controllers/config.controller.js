const logger = require('../config/logger');
const { configService } = require('../services');

const getNeo4jConnections = (req, res) => {
  logger.debug(`Getting NEO4J config for user: ${JSON.stringify(req.user)}`);
  const neo4jConnections = configService.getNeo4jConnections(req.user);
  logger.debug(`Retrieved matched with user sysRight NEO4J connections: ${JSON.stringify(neo4jConnections)}`);
  res.send(neo4jConnections);
};

const getCyberSampleQueries = (req, res) => {
  const cyberSampleQueries = configService.getCyberSampleQueries();
  res.send(cyberSampleQueries);
};

module.exports = {
  getNeo4jConnections,
  getCyberSampleQueries,
};
