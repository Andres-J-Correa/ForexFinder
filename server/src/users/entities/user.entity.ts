import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
@Index('idx_users_role', ['role'])
export default class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ nullable: true })
  hashedRefreshToken: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  modifiedAt: Date;
}
