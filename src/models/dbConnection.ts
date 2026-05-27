import mongoose from 'mongoose';

import config from '../configs/common.config';

import dataSeeder from './seeders/index';

export const isMongoConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export const connectDatabase = async (): Promise<boolean> => {
  if (!isMongoConnected()) {
    await mongoose.connect(config.MONGO_URI);
  }

  await dataSeeder();

  return true;
};

export const disconnectDatabase = async (): Promise<void> => {
  if (isMongoConnected()) {
    await mongoose.disconnect();
  }
};

export const isDatabaseConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};
