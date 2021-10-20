const logger = require('../config/logger');
const catchAsync = require('../utils/catchAsync');
const { fileService } = require('../services');

const downloadFile = catchAsync(async (req, res) => {
  logger.debug(`Download a file: ${JSON.stringify(req.params)}`);
  const absoluteFilePath = fileService.fetchFilePathByFileName(req.params);
  res.download(absoluteFilePath);
});

module.exports = {
  downloadFile,
};
