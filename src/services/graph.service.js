const fs = require('fs');
const path = require('path');
const { v4: uuid4 } = require('uuid');
const httpStatus = require('http-status');
const logger = require('../config/logger');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');
const executeChildProcess = require('../utils/executeChildProcess');

const _createTemporaryFolders = () => {
  const projectDirectoryPath = path.dirname(require.main.filename || process.mainModule.filename);
  const temporaryDirectoryPath = path.join(projectDirectoryPath, 'tmp');
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(temporaryDirectoryPath)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(temporaryDirectoryPath);
  }
  const importTemporaryDirectoryPath = path.join(temporaryDirectoryPath, 'import');
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(importTemporaryDirectoryPath)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(importTemporaryDirectoryPath);
  }
  const exportTemporaryDirectoryPath = path.join(temporaryDirectoryPath, 'export');
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(exportTemporaryDirectoryPath)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(exportTemporaryDirectoryPath);
  }
};

const _writeGraphMLContentToFile = (graphMLContent) => {
  const projectDirectoryPath = path.dirname(require.main.filename || process.mainModule.filename);
  const temporaryDirectoryPath = path.join(projectDirectoryPath, 'tmp', 'import');
  const filepath = path.join(temporaryDirectoryPath, `${uuid4()}.graphml`);
  const massagedGraphMLContent = graphMLContent.replace(/&lt;/g, '<');
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(filepath, massagedGraphMLContent);
  return filepath;
};

const _copyExportedCSVFileToTemporaryFolder = (csvFilePath) => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (fs.existsSync(csvFilePath)) {
    const filename = `${uuid4()}.csv`;
    const projectDirectoryPath = path.dirname(require.main.filename || process.mainModule.filename);
    const temporaryDirectoryPath = path.join(projectDirectoryPath, 'tmp', 'export');
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
    _createTemporaryFolders();
    const jarLocation = config.bochkDataExplorer.convertGraphML2CSVJarLocation;
    const graphMLUseUUIDAsFilename = config.bochkDataExplorer.exportGraphMLUseUUIDAsFilename;
    const graphMLFilePath = _writeGraphMLContentToFile(graphMLContent);
    const outputFolderPath = config.bochkDataExplorer.exportGraphMLFolderPath;
    const outputFileType = config.bochkDataExplorer.exportGraphMLFileType;
    const command = `java -jar ${jarLocation} --graph="${graphMLFilePath}" --type=${outputFileType} --outpath=${outputFolderPath} --isUUID=${graphMLUseUUIDAsFilename}`;
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
