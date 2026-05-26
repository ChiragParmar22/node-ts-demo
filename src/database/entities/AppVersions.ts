import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { DeviceType } from '../../constants/key.constants';

@Entity('appVersions')
export class AppVersions extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: DeviceType,
    nullable: true,
  })
  deviceType!: DeviceType | null;

  @Column({ type: 'varchar' })
  versionCode!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}
