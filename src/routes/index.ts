import express from 'express';

import authRoutes from './auth.routes';
import contactUsRoutes from './contactUs.routes';
import messageRoutes from './message.routes';
import notificationRoutes from './notification.routes';
import userRoutes from './user.routes';

const mainRouter = express.Router();

mainRouter.use('/auth', authRoutes);
mainRouter.use('/user', userRoutes);
mainRouter.use('/contactUs', contactUsRoutes);
mainRouter.use('/notification', notificationRoutes);
mainRouter.use('/message', messageRoutes);

export default mainRouter;
