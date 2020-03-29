import { MessageEmbed, TextChannel, DMChannel, Message, User } from 'discord.js';

export enum TaskStatus {
	Active,
	Completed,
	Failed
}

const TaskStatusColourMap = {
	[TaskStatus.Active]: '#fffa9c',
	[TaskStatus.Completed]: '#a1ff9c',
	[TaskStatus.Failed]: '#ff0000'
};

interface TaskData {
	title: string;
	description: string;
	issuer: User;
	status?: TaskStatus;
}

type TextBasedChannel = TextChannel | DMChannel;

export class Task extends MessageEmbed {
	public status: TaskStatus;
	public readonly id: number;
	private readonly issuer: User;
	private message?: Message;
	public constructor(data: TaskData) {
		super();
		this.status = TaskStatus.Active;
		this.issuer = data.issuer;
		this.id = Date.now();
		this.setFooter(`Issued by ${this.issuer.tag} | Task ID ${this.id}`);
		this.update(data);
	}

	public update(data: Partial<TaskData>) {
		if (typeof data.status !== 'undefined') {
			this.status = data.status;
		}
		if (typeof data.title !== 'undefined') {
			this.title = data.title;
		}
		if (typeof data.description !== 'undefined') {
			this.description = data.description;
		}
		this.setColor(TaskStatusColourMap[this.status]);
		this.setTimestamp(Date.now());
		if (this.message) {
			return this.message.edit(this);
		}
	}

	public async sendTo(channel: TextBasedChannel) {
		this.message = await channel.send(this);
	}
}
