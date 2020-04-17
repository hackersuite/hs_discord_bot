import { Message, TextChannel, DMChannel } from 'discord.js';
import { Command } from 'discord-akairo';
import { modifyUserRoles, getUser } from '@unicsmcr/hs_discord_bot_api_client';
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
	'css': 'role.languages.html_css'
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
		const mappedRoles = [];
		for (const [roleName, resourceName] of Object.entries(MentorMappings)) {
			if (roles.includes(roleName)) {
				mappedRoles.push(resourceName);
			}
		}
		try {
			const existingRoles = (await getUser(message.author.id)).roles
				.map(res => res.name)
				.filter(name => !name.startsWith('role.languages'));

			await modifyUserRoles(message.author.id, {
				method: 'set',
				roles: existingRoles.concat(mappedRoles)
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
