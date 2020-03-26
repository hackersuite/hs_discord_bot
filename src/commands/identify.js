const { Command } = require('discord-akairo');
const { getAllUsers } = require('../hs_auth');

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
		const users = await getAllUsers();
		for (const user of users) {
			if (user.authId === args.id) {
				return message.reply(`Hi ${user.name}!`);
			}
		}
		return message.reply('Sorry, I could not find you :(');
	}
}

module.exports = IdentifyCommand;
