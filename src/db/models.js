const { DataTypes } = require('sequelize');

exports.User = null;
exports.UserAttributes = {
	authID: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	discordID: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	name: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	authLevel: {
		type: DataTypes.TINYINT,
		allowNull: false
	},
	team: {
		type: DataTypes.STRING,
		allowNull: true
	}
};

exports.Team = null;
exports.TeamAttributes = {
	authID: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	channelID: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	roleID: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	name: {
		type: DataTypes.TEXT,
		allowNull: false
	}
};
