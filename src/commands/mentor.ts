import { Message, TextChannel, DMChannel } from 'discord.js';
import { Command } from 'discord-akairo';
import { modifyUserRoles, getUser, AuthLevel } from '@unicsmcr/hs_discord_bot_api_client';
import { Task, TaskStatus } from '../util/task';

const MentorMappings = {
	'python': 'role.languages.python',
	'javascript': 'role.languages.javascript',
	'java': 'role.languages.java',
	'c': 'role.languages.c',
	'c#': 'role.languages.csharp',
	'c++': 'role.languages.cpp',
	'swift': 'role.languages.swift',
	'go': 'role.languages.go',
	'kotlin': 'role.languages.kotlin',
	'rust': 'role.languages.rust',
	'scala': 'role.languages.scala',
	'ruby': 'role.languages.ruby',
	'html+css': 'role.languages.html_css',
	'html': 'role.languages.html_css',
	'css': 'role.languages.html_css',
	'react': 'role.languages.react',
	'vue': 'role.languages.vue',
	'android': 'role.languages.android',
	'php': 'role.languages.php'
};

export default class MentorCommand extends Command {
	public constructor() {
		super('mentor', {
			aliases: ['mentor'],
			args: [
				{
					id: 'roles',
					type: 'lowercase',
					match: 'content'
				}
			],
			channel: 'guild'
		});
	}

	public async exec(message: Message, args: { roles: string }) {
		const task = new Task({
			title: 'Update Mentor Roles',
			issuer: message.author,
			description: 'Updating your mentoring status...'
		});
		await task.sendTo(message.channel as TextChannel | DMChannel);

		const roles = args.roles.split(' ');
		const langRoles = [];
		for (const [roleName, resourceName] of Object.entries(MentorMappings)) {
			if (roles.includes(roleName)) {
				langRoles.push(resourceName);
			}
		}
		try {
			const user = await getUser(message.author.id);
			if (user.authLevel < AuthLevel.Volunteer) {
				return task.update({
					status: TaskStatus.Failed,
					description: 'Sorry, you need to be a volunteer or organiser to use this command.'
				});
			}
			const existingRoles = user.roles
				.map(res => res.name)
				.filter(name => !name.startsWith('role.languages'));

			await modifyUserRoles(message.author.id, {
				method: 'set',
				roles: existingRoles.concat(langRoles)
			});

			task.update({
				status: TaskStatus.Completed,
				description: 'Your new mentor roles have been set!'
			});
		} catch (err) {
			task.update({
				status: TaskStatus.Failed,
				description: `An error occurred processing your request. Please try again later.`
			});
		}
	}
}
