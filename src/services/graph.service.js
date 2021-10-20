const fs = require('fs');
const path = require('path');
const { v4: uuid4 } = require('uuid');
const httpStatus = require('http-status');
const logger = require('../config/logger');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');
const executeChildProcess = require('../utils/executeChildProcess');

const _createTemporaryFolder = () => {
  const projectDirectoryPath = path.dirname(require.main.filename || process.mainModule.filename);
  const temporaryDirectoryPath = path.join(projectDirectoryPath, 'tmp');
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(temporaryDirectoryPath)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(temporaryDirectoryPath);
  }
};

const _writeGraphMLContentToFile = (graphMLContent) => {
  const projectDirectoryPath = path.dirname(require.main.filename || process.mainModule.filename);
  const temporaryDirectoryPath = path.join(projectDirectoryPath, 'tmp');
  const filepath = path.join(temporaryDirectoryPath, `${uuid4()}.graphml`);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(filepath, graphMLContent);
  return filepath;
};

const _copyExportedCSVFileToTemporaryFolder = (csvFilePath) => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (fs.existsSync(csvFilePath)) {
    const filename = `${uuid4()}.csv`;
    const projectDirectoryPath = path.dirname(require.main.filename || process.mainModule.filename);
    const temporaryDirectoryPath = path.join(projectDirectoryPath, 'tmp');
    const destinationFilePath = path.join(temporaryDirectoryPath, filename);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.copyFileSync(csvFilePath, destinationFilePath);
    return {
      filename,
      filePath: destinationFilePath,
    };
  }
  return {
    filename: path.basename(csvFilePath),
    filePath: csvFilePath,
  };
};

/**
 * Transforms the Graph ML content as a CSV file
 * @param {Object} parameters request parameters
 * @returns {String} csvFilePath the file path of the CSV file
 */
const transformGraphMLToCSV = async (parameters) => {
  logger.info(`Transform the graphML content process started`);
  const { graphMLContent } = parameters;
  if (!graphMLContent) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Parameter missing: graphMLContent');
  }
  try {
    _createTemporaryFolder();
    const jarLocation = config.bochkDataExplorer.convertGraphML2CSVJarLocation;
    const jarClassName = config.bochkDataExplorer.convertGraphML2CSVJarClassName;
    const graphMLFilePath = _writeGraphMLContentToFile(graphMLContent);
    const outputFolderPath = config.bochkDataExplorer.exportGraphMLFolderPath;
    const outputFileType = config.bochkDataExplorer.exportGraphMLFileType;
    const command = `java -cp ${jarLocation} ${jarClassName} ${graphMLFilePath} ${outputFolderPath} ${outputFileType} D`;
    let csvFilePath = await executeChildProcess(command);
    csvFilePath = csvFilePath.replace('\n', '');
    return _copyExportedCSVFileToTemporaryFolder(csvFilePath);
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed: ${err.message}`);
  }
};

module.exports = {
  transformGraphMLToCSV,
};
