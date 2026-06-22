import { Types } from 'mongoose';
import Stripe from 'stripe';

import config from '../configs/common.config';
import {
  KYC_STATUS,
  NotificationType,
  TransactionStatus,
} from '../constants/key.constants';
import messagesConstants from '../constants/messages.constants';
import StripeExternalAccountRepository from '../repositories/stripeExternalAccount.repository';
import TransactionRepository from '../repositories/transaction.repository';
import UserRepository from '../repositories/user.repository';

import NotificationService from './notification.service';
import StripeService from './stripe.service';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendNotification(
  userId: string,
  title: string,
  message: string,
  notificationData: Record<string, unknown>
): Promise<void> {
  await NotificationService.createNotification({
    userId,
    title,
    message,
    type: (notificationData.type as string) || '',
    data: notificationData,
  });
}

export default class StripeWebhookService {
  /**
   * Handle verified Stripe events
   */
  static async handleEvent(event: Stripe.Event): Promise<void> {
    console.log('Stripe Webhook received:', event.type);
    switch (event.type) {
      case 'payment_intent.succeeded': {
        try {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          if (paymentIntent.metadata?.projectName === config.APP_NAME) {
            const { transactionKey, userId, transactionType } =
              paymentIntent.metadata as any;
            const transaction = await TransactionRepository.findOne({
              paymentIntentId: paymentIntent.id,
              userId: new Types.ObjectId(userId),
              transactionType,
              transactionKey,
            });
            if (transaction) {
              await delay(3000);
              const charges = await StripeService.retrieveCharge(
                paymentIntent.latest_charge as string
              );
              const chargeTransaction =
                await StripeService.retrieveBalanceTransaction(
                  charges.balance_transaction as string
                );
              const user = await UserRepository.findUserById(userId);
              if (!user) {
                console.error(`User with ID ${userId} not found.`);
                return;
              }

              await Promise.all([
                TransactionRepository.findOneAndUpdate(
                  { _id: transaction._id },
                  {
                    status: TransactionStatus.COMPLETED,
                    paymentMethodId: paymentIntent.payment_method as string,
                    fee: (chargeTransaction.fee || 0) / 100,
                    netAmount: (chargeTransaction.net || 0) / 100,
                    transactionId: chargeTransaction.id,
                    chargeId: charges.id,
                    balanceAvailableDate: chargeTransaction.available_on * 1000,
                  }
                ),
                UserRepository.updateUser(
                  { _id: new Types.ObjectId(userId) },
                  {
                    $inc: { walletBalance: transaction.amount },
                  }
                ),
              ]);

              console.log(
                `Transaction ${transaction._id} marked as COMPLETED.`
              );

              const notificationData = {
                userId: String(user._id),
                type: NotificationType.DEPOSIT_SUCCESS,
              };
              const title = 'Payment Update';
              const message = messagesConstants.DEPOSIT_SUCCESSFUL(
                transaction.amount
              );
              await sendNotification(
                String(user._id),
                title,
                message,
                notificationData
              );
            }
          }
        } catch (error: any) {
          console.error('Error in payment_intent.succeeded:', error.message);
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        try {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log('Payment failed →', paymentIntent.metadata);
          if (paymentIntent.metadata?.projectName === config.APP_NAME) {
            const { transactionKey, userId, transactionType } =
              paymentIntent.metadata as any;
            const transaction = await TransactionRepository.findOne({
              paymentIntentId: paymentIntent.id,
              userId: new Types.ObjectId(userId),
              transactionType,
              transactionKey,
            });
            if (transaction) {
              await TransactionRepository.findOneAndUpdate(
                { _id: transaction._id },
                {
                  status: TransactionStatus.FAILED,
                  paymentMethodId: paymentIntent.payment_method as string,
                }
              );

              const notificationData = {
                userId: String(userId),
                type: NotificationType.DEPOSIT_FAILED,
              };
              const title = 'Payment Update';
              const message = messagesConstants.DEPOSIT_FAILED(
                transaction.amount
              );
              await sendNotification(
                String(userId),
                title,
                message,
                notificationData
              );

              console.log(`Transaction ${transaction._id} marked as FAILED.`);
            }
          }
        } catch (error: any) {
          console.error(
            'Error in payment_intent.payment_failed:',
            error.message
          );
        }
        break;
      }
      case 'payment_intent.canceled': {
        try {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log('Payment canceled →', paymentIntent.metadata);
          if (paymentIntent.metadata?.projectName === config.APP_NAME) {
            const { transactionKey, userId, transactionType } =
              paymentIntent.metadata as any;
            const transaction = await TransactionRepository.findOne({
              paymentIntentId: paymentIntent.id,
              userId: new Types.ObjectId(userId),
              transactionType,
              transactionKey,
            });
            if (transaction) {
              await TransactionRepository.findOneAndUpdate(
                { _id: transaction._id },
                {
                  status: TransactionStatus.CANCELED,
                  paymentMethodId: paymentIntent.payment_method as string,
                }
              );
              const notificationData = {
                userId: String(userId),
                type: NotificationType.DEPOSIT_CANCELED,
              };
              const title = 'Payment Update';
              const message = messagesConstants.DEPOSIT_CANCELED(
                transaction.amount
              );
              await sendNotification(
                String(userId),
                title,
                message,
                notificationData
              );
              console.log(`Transaction ${transaction._id} marked as CANCELED.`);
            }
          }
        } catch (error: any) {
          console.error('Error in payment_intent.canceled:', error.message);
        }
        break;
      }
      case 'payout.canceled': {
        try {
          const payout = event.data.object as Stripe.Payout;
          if (payout.metadata?.projectName === config.APP_NAME) {
            const transaction = await TransactionRepository.findOne({
              transactionKey: payout.metadata.transactionKey,
              payoutId: payout.id,
            });

            if (transaction) {
              const user = await UserRepository.findUserById(
                String(transaction.userId)
              );

              if (!user) {
                console.error(`User with ID ${transaction.userId} not found.`);
                return;
              }

              await TransactionRepository.findOneAndUpdate(
                { _id: transaction._id },
                {
                  transactionId: payout.balance_transaction as string,
                  status: TransactionStatus.FAILED,
                }
              );

              const walletAmount =
                Number((user.walletBalance + transaction.amount).toFixed(2)) ||
                0;
              await UserRepository.updateUser(
                { _id: new Types.ObjectId(transaction.userId) },
                { walletBalance: walletAmount }
              );
              const notificationData = {
                userId: String(transaction.userId),
                type: NotificationType.PAYOUT_CANCELED,
              };
              const title = 'Withdrawal Update';
              const message = messagesConstants.WITHDRAW_CANCELED(
                transaction.amount
              );
              await sendNotification(
                String(transaction.userId),
                title,
                message,
                notificationData
              );
            }
          }
        } catch (error: any) {
          console.error('Error in payout.canceled:', error.message);
        }
        break;
      }
      case 'payout.failed': {
        try {
          const payout = event.data.object as Stripe.Payout;
          if (payout.metadata?.projectName === config.APP_NAME) {
            const transaction = await TransactionRepository.findOne({
              transactionKey: payout.metadata.transactionKey,
              payoutId: payout.id,
            });
            console.log('Payout failed metadata →', {
              transactionKey: payout.metadata?.transactionKey,
              payoutId: payout.id,
            });
            if (transaction) {
              const user = await UserRepository.findUserById(
                String(transaction.userId)
              );
              if (!user) {
                console.error(`User with ID ${transaction.userId} not found.`);
                return;
              }
              await TransactionRepository.findOneAndUpdate(
                { _id: transaction._id },
                {
                  transactionId: payout.balance_transaction as string,
                  status: TransactionStatus.FAILED,
                }
              );
              console.log(user.walletBalance, transaction.amount);
              const walletAmount = Number(
                ((user.walletBalance ?? 0) + (transaction.amount ?? 0)).toFixed(
                  2
                )
              );
              console.log(walletAmount);
              await UserRepository.updateUser(
                { _id: new Types.ObjectId(transaction.userId) },
                { walletBalance: walletAmount }
              );

              const notificationData = {
                userId: String(transaction.userId),
                type: NotificationType.PAYOUT_FAILED,
              };

              const title = 'Withdrawal Update';
              const message = messagesConstants.WITHDRAW_FAILED(
                transaction.amount,
                payout.failure_message ?? null
              );
              await sendNotification(
                String(transaction.userId),
                title,
                message,
                notificationData
              );
            } else {
              console.warn(
                `Transaction not found for payout ID ${payout.id} with transactionKey ${payout.metadata?.transactionKey}`
              );
            }
          }
        } catch (error: any) {
          console.error('Error in payout.failed:', error.message);
        }
        break;
      }
      case 'payout.paid': {
        try {
          const payout = event.data.object as Stripe.Payout;
          if (payout.metadata?.projectName === config.APP_NAME) {
            const transaction = await TransactionRepository.findOne({
              transactionKey: payout.metadata.transactionKey,
              payoutId: payout.id,
            });
            console.log(transaction);
            if (transaction) {
              console.log(payout.status);
              if (payout.status !== 'paid') {
                if (payout.status === 'failed') {
                  return;
                } else if (payout.status === 'canceled') {
                  return;
                }
                return;
              }
              console.log('PAYOUT.PAID GOES INSIDE :: ', payout);
              const user = await UserRepository.findUserById(
                String(transaction.userId)
              );

              if (!user) {
                console.error(`User with ID ${transaction.userId} not found.`);
                return;
              }

              await TransactionRepository.findOneAndUpdate(
                { _id: transaction._id },
                {
                  transactionId: payout.balance_transaction as string,
                  status: TransactionStatus.COMPLETED,
                }
              );

              const notificationData = {
                userId: String(transaction.userId),
                type: NotificationType.PAYOUT_SUCCESS,
              };
              const title = 'Withdrawal Update';
              const message = messagesConstants.WITHDRAW_SUCCESSFUL(
                transaction.amount
              );
              await sendNotification(
                String(transaction.userId),
                title,
                message,
                notificationData
              );
            }
          }
        } catch (error: any) {
          console.error('Error in payout.paid:', error.message);
        }
        break;
      }
      case 'account.external_account.deleted': {
        try {
          const externalBankAccount = event.data.object as Stripe.BankAccount;
          const bankAccount = await StripeExternalAccountRepository.findOne({
            stripeBankAccountId: externalBankAccount.id,
          });
          if (!bankAccount) {
            console.warn('Bank account not found for deletion.');
            return;
          }

          await StripeExternalAccountRepository.findOneAndDelete({
            stripeBankAccountId: externalBankAccount.id,
          });
        } catch (error: any) {
          console.error(
            'Error in account.external_account.deleted:',
            error.message
          );
        }
        break;
      }
      case 'account.external_account.created':
      case 'account.external_account.updated': {
        try {
          const externalBankAccount = event.data.object as Stripe.BankAccount;
          const bankAccount = await StripeExternalAccountRepository.findOne({
            stripeBankAccountId: externalBankAccount.id,
          });
          if (!bankAccount) {
            const user = await UserRepository.findUser({
              accountId: externalBankAccount.account as string,
            });
            if (user) {
              await StripeExternalAccountRepository.create({
                stripeBankAccountId: externalBankAccount.id,
                holderName: user.name,
                userId: user._id,
                bankName: externalBankAccount.bank_name || '',
                accountNumber: externalBankAccount.last4 || '',
                routingNumber: externalBankAccount.routing_number || '',
                country: externalBankAccount.country || '',
                fingerPrint: externalBankAccount.fingerprint || '',
                holderType:
                  externalBankAccount.account_holder_type || 'individual',
              });
            }
          }
        } catch (error: any) {
          console.error(
            'Error in account.external_account.created/updated:',
            error.message
          );
        }
        break;
      }
      case 'account.updated': {
        try {
          const account = event.data.object as Stripe.Account;
          const user = await UserRepository.findUser({
            accountId: account.id,
          });

          if (!user) {
            console.warn(`User Not Found for account ID ${account.id}`);
            return;
          }

          let kycStatus = user.kycStatus;

          const currentlyDue = account.requirements?.currently_due || [];

          if (account.requirements?.disabled_reason?.startsWith('rejected')) {
            kycStatus = KYC_STATUS.REJECTED;
          } else if (!account.details_submitted) {
            kycStatus = KYC_STATUS.PENDING;
          } else {
            const nonDocumentRequirements = currentlyDue.filter(
              (field: string) => !field.includes('verification.document')
            );

            if (nonDocumentRequirements.length > 0) {
              kycStatus = KYC_STATUS.REQUESTED;
            } else {
              kycStatus = KYC_STATUS.VERIFIED;
            }
          }

          if (
            user.kycStatus !== KYC_STATUS.VERIFIED &&
            kycStatus === KYC_STATUS.VERIFIED
          ) {
            await sendNotification(
              String(user._id),
              'KYC Verified',
              messagesConstants.KYC_VERIFIED,
              {
                type: NotificationType.KYC_VERIFIED,
              }
            );
          }

          if (
            user.kycStatus !== KYC_STATUS.REJECTED &&
            kycStatus === KYC_STATUS.REJECTED
          ) {
            const accountLink = await StripeService.uploadKYC({
              accountId: account.id,
            });

            await sendNotification(
              String(user._id),
              'KYC Verification Failed',
              messagesConstants.KYC_REJECTED,
              {
                type: NotificationType.KYC_REJECTED,
                onboardingLink: accountLink.url,
              }
            );
          }

          await UserRepository.updateUser(
            {
              accountId: account.id,
            },
            {
              kycStatus,
            }
          );

          if (
            user.kycStatus !== KYC_STATUS.VERIFIED &&
            kycStatus === KYC_STATUS.VERIFIED
          ) {
            const bankAccounts = await StripeService.listBankAccounts(
              account.id
            );

            for (const bankAccount of bankAccounts.data) {
              if (bankAccount.status === 'verified') {
                const exists = await StripeExternalAccountRepository.findOne({
                  stripeBankAccountId: bankAccount.id,
                });

                if (!exists) {
                  await StripeExternalAccountRepository.create({
                    stripeBankAccountId: bankAccount.id,
                    holderName: `${account.individual?.first_name || ''} ${
                      account.individual?.last_name || ''
                    }`,
                    userId: user._id,
                    bankName: bankAccount.bank_name || '',
                    accountNumber: bankAccount.last4 || '',
                    routingNumber: bankAccount.routing_number || '',
                    country: bankAccount.country || '',
                    fingerPrint: bankAccount.fingerprint || '',
                    holderType: bankAccount.account_holder_type || 'individual',
                  });
                }
              }
            }
          }
        } catch (error: any) {
          console.error('Error in account.updated:', error.message);
        }
        break;
      }
      case 'account.application.authorized': {
        const account = event.data.object;
        console.log('Account application authorized:', account);
        break;
      }
      case 'account.application.deauthorized': {
        const account = event.data.object;
        console.log('Account application deauthorized:', account);
        break;
      }
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }
  }
}
