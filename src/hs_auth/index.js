const auth = require('@unicsmcr/hs_auth_client');
const { token } = require('../../data/config.json').hs_auth;

exports.getCurrentUser = originalURL => auth.getCurrentUser(originalURL);
exports.getAllUsers = () => auth.getAllUsers(token);
exports.putCurrentUser = name => auth.putCurrentUser(name, token);
exports.getTeams = () => auth.getTeams(token);
exports.getTeam = team => auth.getTeam(token, team);
