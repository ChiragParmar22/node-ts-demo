import dataSeeder from './seeders/dataSeeder';
import AppDataSource from './data-source';

export const connectDatabase = async (): Promise<boolean> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  await dataSeeder();
  return true;
};

export const disconnectDatabase = async (): Promise<void> => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
};

export const isDatabaseConnected = (): boolean => {
  return AppDataSource.isInitialized;
};

export { AppDataSource };
