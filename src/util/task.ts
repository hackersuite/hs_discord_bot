import { MessageEmbed, TextChannel, DMChannel, Message, User } from 'discord.js';

export enum TaskStatus {
	Active,
	Completed,
	Failed
}

const TaskStatusColourMap = {
	[TaskStatus.Active]: '#fffa9c',
	[TaskStatus.Completed]: '#9cffab',
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
		this._updateData(data);
	}

	private _updateData(data: Partial<TaskData>) {
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
	}

	public async update(data: Partial<TaskData>) {
		this._updateData(data);
		if (this.message) {
			await this.message.edit(this);
		}
		return Promise.resolve(this);
	}

	public async sendTo(channel: TextBasedChannel) {
		this.message = await channel.send(this);
	}
}
