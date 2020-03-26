module.exports = function loadEnvironment(config) {
	process.env.AUTH_URL = config.hs_auth.url;
};
