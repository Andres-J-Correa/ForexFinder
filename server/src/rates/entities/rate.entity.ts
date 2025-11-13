import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';

import Shop from '@/shops/entities/shop.entity';

@Entity('rates')
@Unique(['shopId', 'fromCurrency', 'toCurrency'])
@Index('idx_rates_shop_currency', ['shopId', 'fromCurrency', 'toCurrency'])
@Index('idx_rates_currency_time', ['fromCurrency', 'toCurrency', 'createdAt'])
export default class Rate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'shop_id' })
  shopId: number;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column({ name: 'from_currency', length: 3 })
  fromCurrency: string;

  @Column({ name: 'to_currency', length: 3 })
  toCurrency: string;

  @Column({
    name: 'buy_rate',
    type: 'decimal',
    precision: 10,
    scale: 4,
  })
  buyRate: number;

  @Column({
    name: 'sell_rate',
    type: 'decimal',
    precision: 10,
    scale: 4,
  })
  sellRate: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

