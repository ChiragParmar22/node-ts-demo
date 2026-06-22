import Stripe from 'stripe';

import config from '../configs/common.config';
import messagesConstants from '../constants/messages.constants';
import { IUsers } from '../models/Users';
import StripeExternalAccountRepository from '../repositories/stripeExternalAccount.repository';
import UserRepository from '../repositories/user.repository';
import ApiResponse from '../utils/apiResponse';
import JwtUtil from '../utils/jwt.util';

import StripeService from './stripe.service';

export default class StripeExternalAccountService {
  /**
   * Create stripe external account onboarding link
   */
  static async createExternalAccount(
    user: IUsers,
    token: string,
    country?: string
  ): Promise<ApiResponse> {
    let accountId = user.accountId;

    // Create a new connected account if user doesn't have one
    if (!accountId) {
      const stripeAccount = await StripeService.createConnectAccount({
        type: 'standard',
        email: user.email,
        country: country || 'US',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      accountId = stripeAccount.id;

      // Update accountId on user model
      await UserRepository.updateUserById(user._id, { accountId });
      user.accountId = accountId;
    }

    // Generate onboarding link
    const refreshUrl = `${config.SERVER_URL}/api/stripe/externalAccount/refresh/${token}`;
    const returnUrl = `${config.SERVER_URL}/api/stripe/externalAccount/success?token=${token}`;

    const accountLink = await StripeService.createAccountLink({
      account: accountId,
      type: 'account_onboarding',
      refresh_url: refreshUrl,
      return_url: returnUrl,
    });

    return ApiResponse.success(
      { url: accountLink.url },
      messagesConstants.STRIPE_ONBOARDING_LINK_CREATED
    );
  }

  /**
   * Handle refresh redirect (regenerates onboarding link)
   */
  static async handleRefresh(token: string): Promise<ApiResponse> {
    try {
      const decoded = await JwtUtil.verifyAccessToken(token);
      const user = await UserRepository.findById(decoded.id);

      if (!user || !user.accountId) {
        return ApiResponse.notFound(messagesConstants.USER_NOT_FOUND);
      }

      const refreshUrl = `${config.SERVER_URL}/api/stripe/externalAccount/refresh/${token}`;
      const returnUrl = `${config.SERVER_URL}/api/stripe/externalAccount/success?token=${token}`;

      const accountLink = await StripeService.createAccountLink({
        account: user.accountId,
        type: 'account_onboarding',
        refresh_url: refreshUrl,
        return_url: returnUrl,
      });

      return ApiResponse.success({ url: accountLink.url });
    } catch {
      return ApiResponse.unauthorized(messagesConstants.INVALID_TOKEN);
    }
  }

  /**
   * Handle success redirect (checks onboarding status and saves bank details)
   */
  static async handleSuccess(token: string): Promise<ApiResponse> {
    try {
      const decoded = await JwtUtil.verifyAccessToken(token);
      const user = await UserRepository.findById(decoded.id);

      if (!user) {
        return ApiResponse.notFound(messagesConstants.USER_NOT_FOUND);
      }

      if (!user.accountId) {
        return ApiResponse.notFound(messagesConstants.STRIPE_ACCOUNT_NOT_FOUND);
      }

      // Retrieve account status from Stripe
      const stripeAccount = await StripeService.retrieveConnectAccount(
        user.accountId
      );

      if (stripeAccount.details_submitted) {
        const externalAccounts = stripeAccount.external_accounts?.data || [];
        const savedAccounts = [];

        for (const account of externalAccounts) {
          if (account.object === 'bank_account') {
            const bankAccount = account as Stripe.BankAccount;

            // Check if already stored in DB
            const existing =
              await StripeExternalAccountRepository.getBankAccountByUserId(
                user._id
              );

            if (!existing) {
              const newBank =
                await StripeExternalAccountRepository.createBankAccount({
                  userId: user._id,
                  holderName: bankAccount.account_holder_name || user.name,
                  holderType: bankAccount.account_holder_type || 'individual',
                  email: user.email,
                  bankName: bankAccount.bank_name || '',
                  accountNumber: bankAccount.last4 || '',
                  routingNumber: bankAccount.routing_number || '',
                  stripeBankAccountId: bankAccount.id,
                  fingerPrint: bankAccount.fingerprint || '',
                  country: bankAccount.country || '',
                  currency: bankAccount.currency || '',
                });
              savedAccounts.push(newBank);
            } else {
              // Update existing
              const updatedBank =
                await StripeExternalAccountRepository.updateBankAccountByUserId(
                  user._id,
                  {
                    holderName: bankAccount.account_holder_name || user.name,
                    holderType: bankAccount.account_holder_type || 'individual',
                    bankName: bankAccount.bank_name || '',
                    accountNumber: bankAccount.last4 || '',
                    routingNumber: bankAccount.routing_number || '',
                    stripeBankAccountId: bankAccount.id,
                    fingerPrint: bankAccount.fingerprint || '',
                    country: bankAccount.country || '',
                    currency: bankAccount.currency || '',
                  }
                );
              if (updatedBank) savedAccounts.push(updatedBank);
            }
          }
        }

        return ApiResponse.success(
          { savedAccounts, stripeAccount },
          messagesConstants.STRIPE_BANK_ACCOUNT_SUCCESS
        );
      }

      return ApiResponse.success(
        { stripeAccount },
        'Stripe account onboarding is incomplete.'
      );
    } catch {
      return ApiResponse.unauthorized(messagesConstants.INVALID_TOKEN);
    }
  }
}
