const tryParseJSON = (jsonString, defaultValue) => {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return defaultValue;
  }
};

module.exports = tryParseJSON;
