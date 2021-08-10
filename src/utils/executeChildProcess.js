/* eslint-disable security/detect-child-process */
const BlueBirdPromise = require('bluebird');
const { exec } = require('child_process');

const executeChildProcess = async (command) => {
  const response = await BlueBirdPromise.fromCallback((cb) => exec(command, cb));
  return response;
};

module.exports = executeChildProcess;
