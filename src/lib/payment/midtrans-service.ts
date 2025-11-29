import { prisma } from '@/lib/prisma';
import { SubscriptionTier, SubscriptionStatus, CreditTransactionType } from '@prisma/client';
import { voucherService } from '@/lib/voucher';
import { TIER_PRICING, TIER_CONFIG, getDiscountedPrice } from '@/lib/subscription/credit-config';
import {
  MidtransTransaction,
  MidtransTransactionStatus,
  MidtransNotification,
  CreateSnapTransactionRequest,
  CheckoutData,
  CheckoutResult,
  InvoiceOptions,
  AVAILABLE_PAYMENT_METHODS,
  ENABLED_PAYMENTS,
  PaymentMethod,
} from './midtrans-types';
import { notifyPaymentStatus } from '@/lib/notification/notification-service';
import { recordTrialUpgrade } from '@/lib/subscription/trial-history-service';
import crypto from 'crypto';

// Environment configuration
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';

// Get the appropriate keys based on environment
const getMidtransConfig = () => {
  const isProduction = MIDTRANS_IS_PRODUCTION;
  return {
    serverKey: isProduction
      ? process.env.MIDTRANS_SERVER_KEY_PRODUCTION || process.env.MIDTRANS_SERVER_KEY || ''
      : process.env.MIDTRANS_SERVER_KEY_SANDBOX || process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: isProduction
      ? process.env.MIDTRANS_CLIENT_KEY_PRODUCTION || process.env.MIDTRANS_CLIENT_KEY || ''
      : process.env.MIDTRANS_CLIENT_KEY_SANDBOX || process.env.MIDTRANS_CLIENT_KEY || '',
    snapUrl: isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions',
    apiUrl: isProduction ? 'https://api.midtrans.com/v2' : 'https://api.sandbox.midtrans.com/v2',
  };
};

// Get base URL for callbacks (supports ngrok for sandbox testing)
const getBaseUrl = (): string => {
  // In sandbox mode, prefer NGROK_URL if available for webhook accessibility
  if (!MIDTRANS_IS_PRODUCTION && process.env.NGROK_URL) {
    return process.env.NGROK_URL;
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export class MidtransService {
  /**
   * Get Midtrans client key for frontend
   */
  getClientKey(): string {
    return getMidtransConfig().clientKey;
  }

  /**
   * Check if using production environment
   */
  isProduction(): boolean {
    return MIDTRANS_IS_PRODUCTION;
  }

  /**
   * Get current environment info (for debugging)
   */
  getEnvironmentInfo(): { isProduction: boolean; hasServerKey: boolean; hasClientKey: boolean } {
    const config = getMidtransConfig();
    return {
      isProduction: MIDTRANS_IS_PRODUCTION,
      hasServerKey: !!config.serverKey,
      hasClientKey: !!config.clientKey,
    };
  }

  /**
   * Create transaction for subscription checkout
   */
  async createSubscriptionInvoice(
    checkoutData: CheckoutData,
    options?: InvoiceOptions
  ): Promise<CheckoutResult> {
    const { userId, tier, durationMonths, voucherCode, payerEmail, payerName } = checkoutData;

    // Calculate price
    const priceDetails = getDiscountedPrice(tier, durationMonths);
    let finalAmount = priceDetails.discountedTotal;
    let discountAmount = priceDetails.savings;
    let voucherDiscountAmount = 0;

    // Apply voucher if provided
    if (voucherCode) {
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });

      const currentTier = subscription?.tier || SubscriptionTier.FREE;
      const voucherResult = await voucherService.applyVoucher(
        voucherCode,
        userId,
        currentTier,
        finalAmount,
        undefined, // subscriptionId
        durationMonths
      );

      if (voucherResult.success && voucherResult.discountResult) {
        voucherDiscountAmount = voucherResult.discountResult.discountAmount;
        finalAmount = voucherResult.discountResult.finalAmount;
        discountAmount += voucherDiscountAmount;
      }
    }

    // Generate order ID (max 50 chars for Midtrans)
    // Format: GNG-{shortUserId}-{tier initial}-{duration}-{timestamp}
    const shortUserId = userId.replace('user_', '').substring(0, 8);
    const tierInitial = tier.charAt(0).toUpperCase();
    const timestamp = Date.now().toString(36); // Base36 for shorter timestamp
    const orderId = `GNG-${shortUserId}-${tierInitial}${durationMonths}-${timestamp}`;

    // Create transaction request
    const transactionRequest: CreateSnapTransactionRequest = {
      transaction_details: {
        order_id: orderId,
        gross_amount: finalAmount,
      },
      customer_details: {
        first_name: payerName || options?.payerName || 'User',
        email: payerEmail || options?.payerEmail,
      },
      item_details: [
        {
          id: `${tier}_${durationMonths}m`,
          name: `Gengo ${tier} Plan - ${durationMonths} bulan`,
          price: TIER_PRICING[tier],
          quantity: durationMonths,
          category: 'subscription',
        },
      ],
      callbacks: {
        finish: options?.successRedirectUrl || `${APP_URL}/app/payment/success`,
        error: options?.failureRedirectUrl || `${APP_URL}/app/payment/failed`,
        pending: options?.pendingRedirectUrl || `${APP_URL}/app/payment/pending`,
      },
      expiry: {
        unit: 'hour',
        duration: 24,
      },
      enabled_payments: ENABLED_PAYMENTS,
      credit_card: {
        secure: true,
      },
    };

    // Add discount item if applicable
    if (discountAmount > 0) {
      transactionRequest.item_details?.push({
        id: 'discount',
        name: voucherCode ? `Diskon (${voucherCode})` : 'Diskon Durasi',
        price: -discountAmount,
        quantity: 1,
        category: 'discount',
      });
    }

    try {
      const transaction = await this.createSnapTransaction(transactionRequest);

      // Store pending payment in database
      await this.storePendingPayment(userId, tier, durationMonths, orderId, transaction, {
        originalAmount: priceDetails.originalTotal,
        discountAmount,
        voucherCode,
        changeType: checkoutData.changeType,
        scheduledForNextPeriod: checkoutData.scheduledForNextPeriod,
      });

      return {
        success: true,
        snapToken: transaction.token,
        redirectUrl: transaction.redirect_url,
        orderId,
        originalAmount: priceDetails.originalTotal,
        discountAmount,
        finalAmount,
      };
    } catch (error) {
      console.error('Error creating subscription transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create transaction',
      };
    }
  }

  /**
   * Create Midtrans Snap transaction
   */
  async createSnapTransaction(request: CreateSnapTransactionRequest): Promise<MidtransTransaction> {
    const midtransConfig = getMidtransConfig();

    console.log('[MidtransService] Creating Snap transaction:', {
      orderId: request.transaction_details.order_id,
      amount: request.transaction_details.gross_amount,
      isProduction: MIDTRANS_IS_PRODUCTION,
      snapUrl: midtransConfig.snapUrl,
    });

    const response = await fetch(midtransConfig.snapUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(midtransConfig.serverKey + ':').toString('base64')}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[MidtransService] Snap transaction failed:', {
        status: response.status,
        error,
      });
      throw new Error(error.error_messages?.[0] || 'Failed to create transaction');
    }

    const result = await response.json();
    console.log('[MidtransService] Snap transaction created:', {
      orderId: request.transaction_details.order_id,
      hasToken: !!result.token,
      hasRedirectUrl: !!result.redirect_url,
    });

    return result;
  }

  /**
   * Get transaction status by order ID
   */
  async getTransactionStatus(orderId: string): Promise<MidtransTransactionStatus | null> {
    const midtransConfig = getMidtransConfig();

    console.log('[MidtransService] Getting transaction status:', {
      orderId,
      apiUrl: midtransConfig.apiUrl,
    });

    const response = await fetch(`${midtransConfig.apiUrl}/${orderId}/status`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(midtransConfig.serverKey + ':').toString('base64')}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('[MidtransService] Transaction not found:', orderId);
        return null;
      }
      console.error('[MidtransService] Failed to get transaction status:', {
        orderId,
        status: response.status,
      });
      throw new Error('Failed to get transaction status');
    }

    const result = await response.json();
    console.log('[MidtransService] Transaction status retrieved:', {
      orderId,
      status: result.transaction_status,
    });

    return result;
  }

  /**
   * Handle Midtrans webhook notification
   */
  async handleNotification(notification: MidtransNotification): Promise<void> {
    const config = getMidtransConfig();

    console.log('[MidtransService] Handling notification:', {
      orderId: notification.order_id,
      transactionId: notification.transaction_id,
      status: notification.transaction_status,
      fraudStatus: notification.fraud_status,
      paymentType: notification.payment_type,
      grossAmount: notification.gross_amount,
      statusCode: notification.status_code,
      isProduction: MIDTRANS_IS_PRODUCTION,
      hasServerKey: !!config.serverKey,
      serverKeyPrefix: config.serverKey?.substring(0, 10) + '...',
    });

    // Verify signature
    if (!this.verifySignature(notification)) {
      console.error('[MidtransService] Invalid signature for order:', notification.order_id, {
        isProduction: MIDTRANS_IS_PRODUCTION,
        envVar: process.env.MIDTRANS_IS_PRODUCTION,
        serverKeyPrefix: config.serverKey?.substring(0, 10) + '...',
      });
      throw new Error('Invalid signature');
    }

    console.log('[MidtransService] Signature verified for order:', notification.order_id);

    // Get pending payment from database
    const pendingPayment = await prisma.pendingPayment.findUnique({
      where: { externalId: notification.order_id },
    });

    if (!pendingPayment) {
      console.error(`[MidtransService] Pending payment not found: ${notification.order_id}`, {
        searchedExternalId: notification.order_id,
      });
      // List recent pending payments for debugging
      const recentPayments = await prisma.pendingPayment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { externalId: true, status: true, createdAt: true },
      });
      console.error('[MidtransService] Recent pending payments:', recentPayments);
      return;
    }

    console.log('[MidtransService] Found pending payment:', {
      id: pendingPayment.id,
      externalId: pendingPayment.externalId,
      userId: pendingPayment.userId,
      tier: pendingPayment.tier,
      status: pendingPayment.status,
    });

    const status = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    // Handle different transaction statuses
    if (status === 'capture' || status === 'settlement') {
      if (fraudStatus === 'accept' || !fraudStatus) {
        // Cast metadata to expected type for handlePaymentSuccess
        const paymentWithTypedMetadata = {
          ...pendingPayment,
          metadata: pendingPayment.metadata as {
            changeType?: string;
            scheduledForNextPeriod?: boolean;
          } | null,
        };
        await this.handlePaymentSuccess(paymentWithTypedMetadata, notification);
      } else {
        await this.handlePaymentFailed(pendingPayment);
      }
    } else if (status === 'pending') {
      // Payment is pending, no action needed
      console.log(`[MidtransService] Payment pending for order: ${notification.order_id}`);
    } else if (status === 'deny' || status === 'cancel' || status === 'failure') {
      await this.handlePaymentFailed(pendingPayment);
    } else if (status === 'expire') {
      await this.handlePaymentExpired(pendingPayment);
    }
  }

  /**
   * Verify Midtrans notification signature
   * Signature = SHA512(order_id + status_code + gross_amount + server_key)
   */
  verifySignature(notification: MidtransNotification): boolean {
    const signatureKey = notification.signature_key;
    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;

    const midtransConfig = getMidtransConfig();
    const hash = crypto
      .createHash('sha512')
      .update(`${orderId}${statusCode}${grossAmount}${midtransConfig.serverKey}`)
      .digest('hex');

    const isValid = hash === signatureKey;

    if (!isValid) {
      console.error('[MidtransService] Signature verification failed:', {
        orderId,
        statusCode,
        grossAmount,
        isProduction: MIDTRANS_IS_PRODUCTION,
        receivedSignature: signatureKey?.substring(0, 20) + '...',
        expectedSignature: hash.substring(0, 20) + '...',
      });
    }

    return isValid;
  }

  /**
   * Get available payment methods
   */
  getAvailablePaymentMethods(): PaymentMethod[] {
    return AVAILABLE_PAYMENT_METHODS;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string): Promise<void> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    await prisma.subscription.update({
      where: { userId },
      data: {
        status: SubscriptionStatus.CANCELED,
      },
    });

    // Record cancellation
    await prisma.creditTransaction.create({
      data: {
        userId,
        type: CreditTransactionType.ADJUSTMENT,
        amount: 0,
        balance: subscription.creditsRemaining,
        description: 'Subscription canceled',
      },
    });
  }

  // Private methods

  private async storePendingPayment(
    userId: string,
    tier: SubscriptionTier,
    durationMonths: number,
    orderId: string,
    transaction: MidtransTransaction,
    metadata: {
      originalAmount: number;
      discountAmount: number;
      voucherCode?: string;
      changeType?: string;
      scheduledForNextPeriod?: boolean;
    }
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const amount = metadata.originalAmount - metadata.discountAmount;

    await prisma.pendingPayment.create({
      data: {
        userId,
        externalId: orderId,
        invoiceId: transaction.token,
        tier,
        durationMonths,
        amount,
        status: 'PENDING',
        invoiceUrl: transaction.redirect_url,
        expiresAt,
        metadata: {
          originalAmount: metadata.originalAmount,
          discountAmount: metadata.discountAmount,
          voucherCode: metadata.voucherCode,
          snapToken: transaction.token,
          changeType: metadata.changeType,
          scheduledForNextPeriod: metadata.scheduledForNextPeriod,
        },
      },
    });
  }

  private async handlePaymentSuccess(
    pendingPayment: {
      id: string;
      userId: string;
      tier: SubscriptionTier;
      durationMonths: number;
      amount: number;
      metadata?: {
        changeType?: string;
        scheduledForNextPeriod?: boolean;
      } | null;
    },
    notification: MidtransNotification
  ): Promise<void> {
    const { userId, tier, durationMonths, amount } = pendingPayment;
    const metadata = pendingPayment.metadata as {
      changeType?: string;
      scheduledForNextPeriod?: boolean;
    } | null;
    const isDowngrade = metadata?.changeType === 'downgrade' && metadata?.scheduledForNextPeriod;

    // Calculate subscription period
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + durationMonths);

    // Get tier config
    const tierConfig = TIER_CONFIG[tier];
    const monthlyCredits = tierConfig.monthlyCredits;
    const totalCredits = monthlyCredits * durationMonths;

    // Update or create subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (isDowngrade && existingSubscription) {
      // For downgrades: schedule the tier change for when current period ends
      await prisma.subscription.update({
        where: { userId },
        data: {
          scheduledTier: tier,
          scheduledTierStartAt: existingSubscription.currentPeriodEnd,
          scheduledDurationMonths: durationMonths,
        },
      });

      console.log(
        `[MidtransService] Downgrade scheduled for user ${userId}: ${tier} starting ${existingSubscription.currentPeriodEnd}`
      );
    } else if (existingSubscription) {
      // Check if user has remaining trial credits that should be preserved
      const hasTrialRemaining =
        existingSubscription.tier === SubscriptionTier.FREE &&
        existingSubscription.trialEndDate &&
        existingSubscription.trialEndDate > now &&
        existingSubscription.trialCreditsUsed < TIER_CONFIG[SubscriptionTier.FREE].trialCredits;

      // Check if this is an upgrade from a paid tier (BASIC → PRO)
      // In this case, preserve remaining credits from the previous subscription
      const isUpgradeFromPaidTier =
        existingSubscription.tier !== SubscriptionTier.FREE &&
        existingSubscription.creditsRemaining > 0;

      // Calculate total credits: new credits + remaining credits from previous subscription (if upgrading)
      const carryOverCredits = isUpgradeFromPaidTier ? existingSubscription.creditsRemaining : 0;
      const finalTotalCredits = totalCredits + carryOverCredits;

      // Immediate activation for upgrades and new subscriptions
      await prisma.subscription.update({
        where: { userId },
        data: {
          tier,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          creditsTotal: finalTotalCredits,
          creditsUsed: 0,
          creditsRemaining: finalTotalCredits,
          // Preserve trial fields if user still has trial credits remaining
          // This allows them to use trial credits first before subscription credits
          ...(hasTrialRemaining
            ? {
                // Keep existing trial data - trial credits will be used first
                // trialStartDate, trialEndDate, trialCreditsUsed preserved
              }
            : {
                // Clear trial fields - no trial credits remaining
                trialStartDate: null,
                trialEndDate: null,
                trialCreditsUsed: 0,
                trialDailyUsed: 0,
              }),
          // Clear any scheduled changes
          scheduledTier: null,
          scheduledTierStartAt: null,
          scheduledDurationMonths: null,
        },
      });

      if (hasTrialRemaining) {
        const trialRemaining =
          TIER_CONFIG[SubscriptionTier.FREE].trialCredits - existingSubscription.trialCreditsUsed;
        console.log(
          `[MidtransService] Preserving ${trialRemaining} trial credits for user ${userId} (expires ${existingSubscription.trialEndDate})`
        );
      }

      if (isUpgradeFromPaidTier) {
        console.log(
          `[MidtransService] Upgrade from ${existingSubscription.tier} to ${tier}: carrying over ${carryOverCredits} credits for user ${userId}`
        );
      }

      // Record credit grant for immediate activation
      await prisma.creditTransaction.create({
        data: {
          userId,
          type: CreditTransactionType.GRANT,
          amount: totalCredits,
          balance: finalTotalCredits,
          description: isUpgradeFromPaidTier
            ? `${tier} subscription - ${durationMonths} month(s) (+ ${carryOverCredits} carried over from ${existingSubscription.tier})`
            : `${tier} subscription - ${durationMonths} month(s)`,
          metadata: {
            tier,
            durationMonths,
            amountPaid: amount,
            paymentType: notification.payment_type,
            transactionId: notification.transaction_id,
            carryOverCredits: isUpgradeFromPaidTier ? carryOverCredits : undefined,
            previousTier: isUpgradeFromPaidTier ? existingSubscription.tier : undefined,
          },
        },
      });

      // Record upgrade in trial history (for anti-abuse tracking)
      if (existingSubscription.tier === SubscriptionTier.FREE) {
        await recordTrialUpgrade(userId);
      }
    } else {
      // New subscription
      await prisma.subscription.create({
        data: {
          userId,
          tier,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          creditsTotal: totalCredits,
          creditsUsed: 0,
          creditsRemaining: totalCredits,
        },
      });

      // Record credit grant for new subscription
      await prisma.creditTransaction.create({
        data: {
          userId,
          type: CreditTransactionType.GRANT,
          amount: totalCredits,
          balance: totalCredits,
          description: `${tier} subscription - ${durationMonths} month(s)`,
          metadata: {
            tier,
            durationMonths,
            amountPaid: amount,
            paymentType: notification.payment_type,
            transactionId: notification.transaction_id,
          },
        },
      });
    }

    // Update pending payment status
    await prisma.pendingPayment.update({
      where: { id: pendingPayment.id },
      data: {
        status: 'PAID',
        paidAt: notification.settlement_time ? new Date(notification.settlement_time) : now,
        paymentMethod: notification.payment_type,
        paymentChannel:
          notification.va_numbers?.[0]?.bank || notification.store || notification.acquirer,
      },
    });

    console.log(
      `[MidtransService] Payment successful for user ${userId}: ${tier} x ${durationMonths} months${isDowngrade ? ' (scheduled)' : ''}`
    );

    // Send success notification
    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);

    await notifyPaymentStatus(userId, 'success', {
      amount: formattedAmount,
      tier: tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase(),
    });
  }

  private async handlePaymentExpired(pendingPayment: {
    id: string;
    userId: string;
  }): Promise<void> {
    await prisma.pendingPayment.update({
      where: { id: pendingPayment.id },
      data: { status: 'EXPIRED' },
    });

    // Send expired notification
    await notifyPaymentStatus(pendingPayment.userId, 'expired');
  }

  private async handlePaymentFailed(pendingPayment: {
    id: string;
    userId: string;
    invoiceUrl: string;
  }): Promise<void> {
    await prisma.pendingPayment.update({
      where: { id: pendingPayment.id },
      data: { status: 'FAILED' },
    });

    // Send failed notification
    await notifyPaymentStatus(pendingPayment.userId, 'failed', {
      invoiceUrl: pendingPayment.invoiceUrl,
    });
  }
}

// Export singleton instance
export const midtransService = new MidtransService();
