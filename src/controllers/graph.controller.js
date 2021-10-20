const logger = require('../config/logger');
const catchAsync = require('../utils/catchAsync');
const { graphService } = require('../services');

const transformGraphMLToCSV = catchAsync(async (req, res) => {
  logger.debug(`Transforming the GraphML content as a CSV file for user: ${JSON.stringify(req.user)}`);
  const requestPayload = {
    ...req.body,
    ...req.query,
  };
  logger.debug(JSON.stringify(requestPayload));
  const csvFilePath = await graphService.transformGraphMLToCSV(requestPayload);
  logger.debug(`Transformed and saved to this path: ${csvFilePath}`);
  res.send(csvFilePath);
});

module.exports = {
  transformGraphMLToCSV,
};
