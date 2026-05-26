import { DataSource } from 'typeorm';

import config from '../configs/common.config';

import { AppVersions } from './entities/AppVersions';
import { ContactUs } from './entities/ContactUs';
import { Notification } from './entities/Notification';
import { OTPMaster } from './entities/OTPMaster';
import { Users } from './entities/Users';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  entities: [AppVersions, OTPMaster, Users, ContactUs, Notification],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: false,
});

export default AppDataSource;
