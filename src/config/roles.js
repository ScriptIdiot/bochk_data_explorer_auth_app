const allRoles = {
  user: ['getAccountInfo', 'getNeo4jConnections', 'getCypherSampleQueries', 'transformGraphMLToCSV'],
  admin: ['getUsers', 'manageUsers'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
