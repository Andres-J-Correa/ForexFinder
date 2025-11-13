import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import User from '@/users/entities/user.entity';
import Shop from '@/shops/entities/shop.entity';

@Entity('location_tokens')
@Index('idx_location_tokens_hash', ['jwtHash'])
@Index('idx_location_tokens_unique_id', ['uniqueId'])
@Index('idx_location_tokens_used_at', ['usedAt'])
export default class LocationToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'jwt_hash', length: 255, unique: true })
  jwtHash: string;

  @Column({ name: 'unique_id', length: 36, unique: true })
  uniqueId: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt: Date | null;

  @Column({ name: 'shop_id', nullable: true })
  shopId: number | null;

  @ManyToOne(() => Shop, { nullable: true })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop | null;

  @Column({ name: 'created_by_admin_id' })
  createdByAdminId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_admin_id' })
  createdByAdmin: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

