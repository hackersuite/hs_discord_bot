const { Command } = require('discord-akairo');
const { getAllUsers, getTeam } = require('../hs_auth');
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

	ensureRoleState(guild, team) {
		const name = `team-${team.id}`;
		return guild.roles.cache.find(role => role.name === name) || guild.roles.create({
			data: {
				name
			}
		});
	}

	ensureChannelState(category, team) {
		const name = `team-${team.id}`;
		return category.children.find(channel => channel.name === name) || category.guild.channels.create(
			name,
			{
				type: 'text',
				parent: category.id,
				topic: `${team.name} | HS ID: ${team.authID}`
			}
		);
	}

	async ensureTeamEntity(team) {
		return (await models.Team.findOrCreate({
			where: { authID: team.id },
			defaults: { authID: team.id, name: team.name }
		}))[0];
	}

	async ensureDiscordState(guild, user, team) {
		const teamEntity = await this.ensureTeamEntity(team);
		const teams = guild.client.config.discord.teams_category_id;
		const role = await this.ensureRoleState(guild, teamEntity);
		const channel = await this.ensureChannelState(guild.channels.cache.get(teams), teamEntity);
		teamEntity.roleID = role.id;
		teamEntity.channelID = channel.id;
		await teamEntity.save();
	}

	async exec(message, args) {
		try {
			const users = await getAllUsers();
			const user = users.find(user => user.authId === args.id);

			if (!user) return message.reply('couldn\'t find a user with that ID! 😢');

			let entry = await models.User.findOne({
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
				entry = await models.User.create({
					authID: user.authId,
					discordID: message.author.id,
					name: user.name,
					authLevel: user.authLevel,
					team: user.team
				});
				message.reply(`Hey **${user.name}**! Your SH account is now linked! 🥳`);
			}

			if (entry.team) {
				const team = await getTeam(entry.team);
				await this.ensureDiscordState(message.guild, message.author, { id: team._id, ...team });
			}
		} catch (err) {
			botLogger.warn(err);
			return message.reply('Sorry, something went wrong there 😕');
		}
	}
}

module.exports = IdentifyCommand;
