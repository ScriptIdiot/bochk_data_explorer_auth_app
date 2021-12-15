const allRoles = {
  user: [
    'getAccountInfo',
    'getNeo4jBrowserConfigurations',
    'getNeo4jConnections',
    'getCypherSampleQueries',
    'transformGraphMLToCSV',
  ],
  admin: ['getUsers', 'manageUsers'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
