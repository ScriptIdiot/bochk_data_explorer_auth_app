const config = require('../config/config');

const produceLoginURL = () => {
  const { loginURL, validateURL, sysCode, appId } = config.bochkUMS;
  return `${loginURL}?redirect=${validateURL}&syscode=${sysCode}&appid=${appId}`;
};

module.exports = {
  produceLoginURL,
};
