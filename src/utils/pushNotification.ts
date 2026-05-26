import admin from 'firebase-admin';

import logger from '../logger/logger';

import serviceAccount from './firebase_config.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const sendFirebaseNotification = async (
  deviceToken: string,
  title: string,
  body: string,
  data: Record<string, unknown> = {},
  sound: string = 'default',
  icon: string = 'notification_icon'
) => {
  let soundData: Pick<admin.messaging.Message, 'android' | 'apns'> | undefined;
  if (sound) {
    soundData = {
      android: { notification: { sound, icon } },
      apns: { payload: { aps: { sound } } },
    };
  }

  const message: admin.messaging.Message = {
    token: deviceToken,
    notification: { title, body },
    data: { data: JSON.stringify(data) },
    ...soundData,
  };
  try {
    const response = await admin.messaging().send(message);
    logger.info(`notification response-->>> ${JSON.stringify(response)}`);
    return response;
  } catch (error) {
    logger.info(`notification error-->>> ${JSON.stringify(error)}`);
    return error;
  }
};

export default sendFirebaseNotification;
