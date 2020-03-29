/* eslint-disable @typescript-eslint/no-unused-vars */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Team } from './Team';

@Entity()
export class User {
	@PrimaryColumn()
	public id!: string;

	@Column({ unique: true, nullable: false })
	public authId!: string;
}
