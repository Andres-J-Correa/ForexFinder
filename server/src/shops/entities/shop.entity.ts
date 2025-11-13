import type { Point } from 'typeorm';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import User from '@/users/entities/user.entity';

@Entity('shops')
@Index('idx_shops_owner', ['ownerUserId'])
export default class Shop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'geography',
    srid: 4326, //WGS84 latitude/longitude
    spatialFeatureType: 'point',
  })
  coordinates: Point;

  @Column({ type: 'text', nullable: true })
  contact: string | null;

  @Column({ type: 'text', nullable: true })
  hours: string | null;

  @Column({ name: 'owner_user_id', nullable: true })
  ownerUserId: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'owner_user_id' })
  owner: User | null;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @CreateDateColumn({ name: 'date_created', type: 'timestamptz' })
  dateCreated: Date;

  @CreateDateColumn({ name: 'date_modified', type: 'timestamptz' })
  dateModified: Date;
}
