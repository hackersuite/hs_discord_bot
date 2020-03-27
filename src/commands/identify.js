const { Command } = require('discord-akairo');
const { getAllUsers } = require('../hs_auth');
const { botLogger } = require('../util/logger');
const models = require('../db/models');

class IdentifyCommand extends Command {
	constructor() {
		super('identify', {
			aliases: ['identify'],
			args: [
				{
					id: 'id',
					type: 'string'
				}
			]
		});
	}

	async exec(message, args) {
		try {
			const users = await getAllUsers();
			const user = users.find(user => user.authId === args.id);

			if (!user) return message.reply('couldn\'t find a user with that ID! 😢');

			const entry = await models.User.findOne({
				where: {
					discordID: message.author.id
				}
			});

			if (entry) {
				entry.authID = user.authId;
				entry.name = user.name;
				entry.authLevel = user.authLevel;
				entry.team = user.team;
				await entry.save();
				message.reply(`You have re-identified with a new SH account, **${user.name}**! 👍`);
			} else {
				await models.User.create({
					authID: user.authId,
					discordID: message.author.id,
					name: user.name,
					authLevel: user.authLevel,
					team: user.team
				});
				return message.reply(`Hey **${user.name}**! Your SH account is now linked! 🥳`);
			}
		} catch (err) {
			botLogger.warn(err.toString());
			return message.reply('Sorry, something went wrong there 😕');
		}
	}
}

module.exports = IdentifyCommand;
