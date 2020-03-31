/* eslint-disable @typescript-eslint/no-unused-vars */
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, PrimaryColumn, Generated } from 'typeorm';
import { User } from './User';

@Entity()
export class Team {
	@PrimaryGeneratedColumn()
	public teamNumber!: number;

	@Column({ unique: true, nullable: false })
	public id!: string;
}
