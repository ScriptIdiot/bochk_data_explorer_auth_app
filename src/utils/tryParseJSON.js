const tryParseJSON = (jsonString, defaultValue) => {
  if (!jsonString || jsonString === null) return defaultValue;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return defaultValue;
  }
};

module.exports = tryParseJSON;
