import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import User from './user.entity';
import { oAuthProviders } from '@/common/constants/oauth-providers';

@Entity('user_identities')
export default class UserIdentity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.identities, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'enum', enum: oAuthProviders })
  provider: typeof oAuthProviders;

  @Column()
  providerUserId: string;

  @Column({ nullable: true })
  accessToken: string;

  @Column({ nullable: true })
  refreshToken: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
