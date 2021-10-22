const fs = require('fs');
const path = require('path');
const httpStatus = require('http-status');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

const fetchFilePathByFileName = (parameters) => {
  const { filename } = parameters;
  if (!filename) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Parameter missing: graphMLContent');
  }
  const projectDirectoryPath = path.dirname(require.main.filename || process.mainModule.filename);
  const temporaryDirectoryPath = path.join(projectDirectoryPath, 'tmp', 'export');
  const targetFilePath = path.join(temporaryDirectoryPath, filename);
  logger.debug('Trying to find whether the target file is exist or not');
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(targetFilePath)) {
    throw new ApiError(httpStatus.NOT_FOUND);
  }
  return targetFilePath;
};

module.exports = {
  fetchFilePathByFileName,
};
