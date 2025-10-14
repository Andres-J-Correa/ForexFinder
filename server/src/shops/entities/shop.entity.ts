import type { Point } from 'typeorm';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('shops')
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

  @CreateDateColumn()
  dateCreated: Date;

  @CreateDateColumn()
  dateModified: Date;
}
