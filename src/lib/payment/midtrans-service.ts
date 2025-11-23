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
  MockInvoiceData,
} from './midtrans-types';
import { notifyPaymentStatus } from '@/lib/notification/notification-service';
import crypto from 'crypto';

// Environment configuration
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || '';
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Midtrans API URLs
const MIDTRANS_SNAP_URL = MIDTRANS_IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

const MIDTRANS_API_URL = MIDTRANS_IS_PRODUCTION
  ? 'https://api.midtrans.com/v2'
  : 'https://api.sandbox.midtrans.com/v2';

// Mock mode for testing without Midtrans account
const MOCK_MODE = !MIDTRANS_SERVER_KEY || process.env.MIDTRANS_MOCK_MODE === 'true';

export class MidtransService {
  /**
   * Check if running in mock mode
   */
  isMockMode(): boolean {
    return MOCK_MODE;
  }

  /**
   * Get Midtrans client key for frontend
   */
  getClientKey(): string {
    return MIDTRANS_CLIENT_KEY;
  }

  /**
   * Check if using production environment
   */
  isProduction(): boolean {
    return MIDTRANS_IS_PRODUCTION;
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

    // Generate order ID
    const orderId = `gengo_${userId}_${tier}_${durationMonths}m_${Date.now()}`;

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
    if (MOCK_MODE) {
      return this.createMockTransaction(request);
    }

    const response = await fetch(MIDTRANS_SNAP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64')}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_messages?.[0] || 'Failed to create transaction');
    }

    return response.json();
  }

  /**
   * Get transaction status by order ID
   */
  async getTransactionStatus(orderId: string): Promise<MidtransTransactionStatus | null> {
    if (MOCK_MODE) {
      return this.getMockTransactionStatus(orderId);
    }

    const response = await fetch(`${MIDTRANS_API_URL}/${orderId}/status`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64')}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to get transaction status');
    }

    return response.json();
  }

  /**
   * Handle Midtrans webhook notification
   */
  async handleNotification(notification: MidtransNotification): Promise<void> {
    console.log(
      `[MidtransService] Handling notification for order ${notification.order_id}:`,
      notification.transaction_status
    );

    // Verify signature
    if (!MOCK_MODE && !this.verifySignature(notification)) {
      console.error(`[MidtransService] Invalid signature for order: ${notification.order_id}`);
      throw new Error('Invalid signature');
    }

    // Get pending payment from database
    const pendingPayment = await prisma.pendingPayment.findUnique({
      where: { externalId: notification.order_id },
    });

    if (!pendingPayment) {
      console.error(`[MidtransService] Pending payment not found: ${notification.order_id}`);
      return;
    }

    const status = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    // Handle different transaction statuses
    if (status === 'capture' || status === 'settlement') {
      if (fraudStatus === 'accept' || !fraudStatus) {
        await this.handlePaymentSuccess(pendingPayment, notification);
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
   */
  verifySignature(notification: MidtransNotification): boolean {
    const signatureKey = notification.signature_key;
    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;

    const hash = crypto
      .createHash('sha512')
      .update(`${orderId}${statusCode}${grossAmount}${MIDTRANS_SERVER_KEY}`)
      .digest('hex');

    return hash === signatureKey;
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

  /**
   * Simulate payment for testing (mock mode only)
   */
  async simulatePayment(
    orderId: string,
    status: 'settlement' | 'expire' | 'cancel'
  ): Promise<void> {
    if (!MOCK_MODE) {
      throw new Error('Simulation only available in mock mode');
    }

    const mockInvoice = await prisma.mockInvoice.findUnique({
      where: { externalId: orderId },
    });

    if (!mockInvoice) {
      throw new Error('Invoice not found');
    }

    const invoiceData = mockInvoice.data as unknown as MockInvoiceData;

    const notification: MidtransNotification = {
      transaction_id: `mock_txn_${Date.now()}`,
      order_id: orderId,
      gross_amount: invoiceData.amount.toString(),
      payment_type: 'bank_transfer',
      transaction_status: status,
      status_code: status === 'settlement' ? '200' : status === 'expire' ? '407' : '202',
      status_message:
        status === 'settlement' ? 'Success' : status === 'expire' ? 'Expired' : 'Canceled',
      signature_key: 'mock_signature',
      transaction_time: new Date().toISOString(),
      settlement_time: status === 'settlement' ? new Date().toISOString() : undefined,
      currency: 'IDR',
    };

    await this.handleNotification(notification);
  }

  // Private methods

  private async createMockTransaction(
    request: CreateSnapTransactionRequest
  ): Promise<MidtransTransaction> {
    const orderId = request.transaction_details.order_id;
    const token = `mock_snap_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = new Date();
    const expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const mockInvoiceData: MockInvoiceData = {
      id: token,
      order_id: orderId,
      status: 'pending',
      amount: request.transaction_details.gross_amount,
      payer_email: request.customer_details?.email,
      description: request.item_details?.[0]?.name || 'Gengo Subscription',
      expiry_time: expiryDate.toISOString(),
      redirect_url: `${APP_URL}/app/payment/mock/${orderId}`,
      created: now.toISOString(),
      updated: now.toISOString(),
      currency: 'IDR',
      success_redirect_url: request.callbacks?.finish,
      failure_redirect_url: request.callbacks?.error,
      items: request.item_details,
    };

    // Store mock invoice in database for retrieval
    await prisma.mockInvoice.create({
      data: {
        invoiceId: token,
        externalId: orderId,
        data: mockInvoiceData as object,
      },
    });

    return {
      token,
      redirect_url: mockInvoiceData.redirect_url,
    };
  }

  private async getMockTransactionStatus(
    orderId: string
  ): Promise<MidtransTransactionStatus | null> {
    const mockInvoice = await prisma.mockInvoice.findUnique({
      where: { externalId: orderId },
    });

    if (!mockInvoice) return null;

    const invoiceData = mockInvoice.data as unknown as MockInvoiceData;

    return {
      transaction_id: invoiceData.id,
      order_id: invoiceData.order_id,
      gross_amount: invoiceData.amount.toString(),
      payment_type: 'bank_transfer',
      transaction_status: invoiceData.status,
      status_code: '200',
      status_message: 'Success',
      transaction_time: invoiceData.created,
      currency: invoiceData.currency,
    };
  }

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
    },
    notification: MidtransNotification
  ): Promise<void> {
    const { userId, tier, durationMonths, amount } = pendingPayment;

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

    if (existingSubscription) {
      await prisma.subscription.update({
        where: { userId },
        data: {
          tier,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          creditsTotal: totalCredits,
          creditsUsed: 0,
          creditsRemaining: totalCredits,
          // Clear trial fields
          trialStartDate: null,
          trialEndDate: null,
          trialCreditsUsed: 0,
          trialDailyUsed: 0,
        },
      });
    } else {
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
    }

    // Record credit grant
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
      `[MidtransService] Payment successful for user ${userId}: ${tier} x ${durationMonths} months`
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
