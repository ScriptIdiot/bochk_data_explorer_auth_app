const { configService } = require('../services');

const getNeo4jConfig = (req, res) => {
  const neo4jConfigurations = configService.getNeo4jConfig();
  res.send(neo4jConfigurations);
};

module.exports = {
  getNeo4jConfig,
};
