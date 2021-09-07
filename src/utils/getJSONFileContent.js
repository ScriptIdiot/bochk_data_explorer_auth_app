const fs = require('fs');

const getJSONFileContent = (filePath, defaultValue = null) => {
  if (typeof filePath !== 'string') {
    return defaultValue;
  }
  try {
    const content = fs.readFileSync(filePath);
    return JSON.parse(content);
  } catch (error) {
    return defaultValue;
  }
};

module.exports = getJSONFileContent;
