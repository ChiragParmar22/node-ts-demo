import * as dotenv from 'dotenv';
// import fs from 'fs';
import { Secret } from 'jsonwebtoken';
dotenv.config();
// dotenv.config({ path: '/var/www/dev.api.NodeTsDemo.com/.env' });

// const env = fs.readFileSync('/etc/environment', 'utf8');
// env.split('\n').forEach((line) => {
//   const match = line.match(/^([^=]+)=(.*)$/);
//   if (match) {
//     const [, key, value] = match;
//     if (key && value) {
//       process.env[key] = value.replace(/^"|"$/g, '');
//     }
//   }
// });

const NODE_ENV = process.env.NODE_ENV || 'dev';
const PORT: number = Number(process.env.PORT || 5050);

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5050';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// DB Configuration
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/nodeTsDemo';

export default {
  APP_NAME: process.env.APP_NAME || 'NodeTsDemo',
  PORT,
  NODE_ENV,

  SERVER_URL,
  CLIENT_URL,

  jwt: {
    secret: process.env.JWT_SECRET as Secret,
    expiresIn: (process.env.JWT_EXPIRES_IN || '12h') as string | number,
    refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as
      | string
      | number,
  },

  PASSWORD_ENCRYPT_LEVEL: Number(process.env.PASSWORD_ENCRYPT_LEVEL || 12),

  MONGO_URI,

  CLIENT_EMAIL: process.env.CLIENT_EMAIL || 'NodeTsDemo@gmail.com',

  MAINTENANCE_MODE: process.env.MAINTENANCE_MODE === 'true',

  TEST_OTP: process.env.TEST_OTP || 1234,

  SMTP_PORT: Number(process.env.SMTP_PORT) || 2525,
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_USERNAME: process.env.SMTP_USERNAME || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
};
