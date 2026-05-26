import cron from 'node-cron';

import logger from '../logger/logger';

export default (): void => {
  // Execute every 1 minutes
  cron.schedule('* * * * *', async (): Promise<boolean> => {
    logger.info('Node Cron: Start');
    try {
      return true;
    } catch (error) {
      logger.error('Node Cron: End', error);
      return false;
    }
  });
};
