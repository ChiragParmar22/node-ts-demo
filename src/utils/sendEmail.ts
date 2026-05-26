import nodemailer, { Transporter } from 'nodemailer';

import config from '../configs/common.config';

import encryptDecrypt from './encryptDecrypt';
import getSecretValue from './infisical';

const smtpPort = config.SMTP_PORT;
const smtpHost = config.SMTP_HOST;
const smtpUser = config.SMTP_USERNAME;
let transporter: Transporter | null = null;

// Initialize transporter instance
const getTransporterInstance = async () => {
  if (transporter) {
    return transporter;
  }

  const smtpPassword = await getSecretValue('SMTP_PASSWORD');
  if (!smtpPassword) {
    throw new Error('Missing SMTP password');
  }

  const smtpPass = encryptDecrypt('decrypt', smtpPassword);

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
    tls: { rejectUnauthorized: false },
  });

  return transporter;
};

export default async (
  to: string,
  subject: string,
  html: string
): Promise<boolean> => {
  try {
    const transporterInstance = await getTransporterInstance();
    await transporterInstance.sendMail({
      from: `${config.APP_NAME} <${config.SMTP_USERNAME}>`,
      to,
      subject,
      html,
    });

    return true;
  } catch (error: unknown) {
    console.log('==========> error.message', (error as Error).message);
    return false;
  }
};
