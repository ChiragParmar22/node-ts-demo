import { InfisicalSDK, SecretType } from '@infisical/sdk';

let infisicalClient: InfisicalSDK | null = null;

interface InitClientParams {
  clientId: string;
  clientSecret: string;
  siteUrl?: string;
}

interface GetSecretValueParams {
  clientId: string;
  clientSecret: string;
  projectId: string;
  environment: string;
  secretName: string;
  path?: string;
  type?: SecretType;
  siteUrl?: string;
}

/**
 * Initialize Infisical client (cached).
 */
const initClient = async ({
  clientId,
  clientSecret,
  siteUrl,
}: InitClientParams) => {
  if (infisicalClient) {
    return infisicalClient;
  }

  const client = new InfisicalSDK({
    siteUrl: siteUrl || 'https://eu.infisical.com',
  });

  await client.auth().universalAuth.login({ clientId, clientSecret });
  infisicalClient = client;

  return infisicalClient;
};

/**
 * Get a secret from Infisical.
 */
const getSecretValue = async ({
  clientId,
  clientSecret,
  projectId,
  environment,
  secretName,
  path = '/NodeTsDemo_dev',
  type = SecretType.Shared,
  siteUrl,
}: GetSecretValueParams) => {
  const client = await initClient({ clientId, clientSecret, siteUrl });

  try {
    const secret = await client.secrets().getSecret({
      projectId,
      environment,
      secretName,
      secretPath: path,
      type,
    });

    return secret.secretValue;
  } catch (error: unknown) {
    console.log('==========> error.message', error);
    throw error;
  }
};

export default async (secretName: string) => {
  try {
    const clientId = process.env.INFISICAL_CLIENT_ID || '';
    const clientSecret = process.env.INFISICAL_CLIENT_SECRET || '';
    const projectId = process.env.INFISICAL_PROJECT_ID || '';

    if (!clientId || !clientSecret || !projectId) {
      throw new Error('Missing Infisical credentials');
    }

    const dbPassword = await getSecretValue({
      clientId,
      clientSecret,
      projectId,
      environment: process.env.INFISICAL_ENV || 'dev',
      path: '/NodeTsDemo_dev',
      secretName,
    });

    return dbPassword;
  } catch {
    return process.env[secretName];
  }
};
