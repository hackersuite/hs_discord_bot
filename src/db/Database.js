const { Sequelize } = require('sequelize');
const { dbLogger } = require('../util/logger');
const models = require('./models');

class Database extends Sequelize {
	constructor() {
		super({
			dialect: 'sqlite',
			storage: './data/db.sqlite',
			logging: msg => dbLogger.info(msg)
		});

		models.User = this.define('User', models.UserAttributes);
		models.Team = this.define('Team', models.TeamAttributes);
	}

	async init() {
		await this.authenticate();
		await this.sync(); // disable alter in prod!
	}
}

module.exports = Database;
