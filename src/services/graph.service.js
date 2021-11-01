const fs = require('fs');
const path = require('path');
const moment = require('moment');
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

const _cleanUpTemporaryFolderFiles = () => {
  const currentDateTimeMoment = moment();
  const outputFolderPath = config.bochkDataExplorer.exportGraphMLFolderPath;
  const projectDirectoryPath = path.dirname(require.main.filename || process.mainModule.filename);
  const temporaryDirectoryImportPath = path.join(projectDirectoryPath, 'tmp', 'import');
  const temporaryDirectoryExportPath = path.join(projectDirectoryPath, 'tmp', 'export');
  const _doCleanUp = (folderPath) => {
    logger.info(`Do clean up for ${folderPath}`);
    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const files = fs.readdirSync(folderPath);
      files.forEach((file) => {
        const absolutePath = path.resolve(folderPath, file);
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const stats = fs.statSync(absolutePath);
        if (stats.isFile()) {
          const createdDateMoment = moment(stats.ctime);
          const accessedDateMoment = moment(stats.atime);
          const modifiedDateMoment = moment(stats.mtime);
          if (
            currentDateTimeMoment.diff(createdDateMoment) > 2 ||
            currentDateTimeMoment.diff(modifiedDateMoment) > 2 ||
            currentDateTimeMoment.diff(accessedDateMoment) > 2
          ) {
            logger.info(`Delete file from path: ${absolutePath}`);
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            fs.unlinkSync(absolutePath);
          }
        }
      });
    } catch (error) {
      logger.error(error);
    }
  };
  _doCleanUp(outputFolderPath);
  _doCleanUp(temporaryDirectoryImportPath);
  _doCleanUp(temporaryDirectoryExportPath);
};

const _copyExportedCSVZipFileToTemporaryFolder = (csvZipFilePath) => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (fs.existsSync(csvZipFilePath)) {
    const filename = `${uuid4()}.zip`;
    const projectDirectoryPath = path.dirname(require.main.filename || process.mainModule.filename);
    const temporaryDirectoryPath = path.join(projectDirectoryPath, 'tmp', 'export');
    const destinationFilePath = path.join(temporaryDirectoryPath, filename);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.copyFileSync(csvZipFilePath, destinationFilePath);
    return {
      filename,
      filePath: destinationFilePath,
    };
  }
  return {
    filename: path.basename(csvZipFilePath),
    filePath: csvZipFilePath,
  };
};

/**
 * Transforms the Graph ML content as a CSV file
 * @param {Object} parameters request parameters
 * @returns {String} csvZipFilePath the file path of the CSV zip file
 */
const transformGraphMLToCSV = async (parameters) => {
  logger.info(`Transform the graphML content process started`);
  const { graphMLContent } = parameters;
  if (!graphMLContent) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Parameter missing: graphMLContent');
  }
  try {
    _createTemporaryFolders();
    _cleanUpTemporaryFolderFiles();
    const jarLocation = config.bochkDataExplorer.convertGraphML2CSVJarLocation;
    const graphMLUseUUIDAsFilename = config.bochkDataExplorer.exportGraphMLUseUUIDAsFilename;
    const graphMLFilePath = _writeGraphMLContentToFile(graphMLContent);
    const outputFolderPath = config.bochkDataExplorer.exportGraphMLFolderPath;
    const outputFileType = config.bochkDataExplorer.exportGraphMLFileType;
    const command = `java -jar ${jarLocation} --graph="${graphMLFilePath}" --type=${outputFileType} --outpath=${outputFolderPath} --isUUID=${graphMLUseUUIDAsFilename}`;
    let csvZipFilePath = await executeChildProcess(command);
    csvZipFilePath = csvZipFilePath.replace('\n', '');
    return _copyExportedCSVZipFileToTemporaryFolder(csvZipFilePath);
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed: ${err.message}`);
  }
};

module.exports = {
  transformGraphMLToCSV,
};
