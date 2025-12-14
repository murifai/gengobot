import { SubscriptionTier } from '@prisma/client';

// Midtrans Transaction Types
export interface MidtransTransaction {
  token: string;
  redirect_url: string;
}

export interface MidtransTransactionStatus {
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_status: MidtransTransactionStatusType;
  fraud_status?: string;
  status_code: string;
  status_message: string;
  merchant_id?: string;
  transaction_time: string;
  settlement_time?: string;
  expiry_time?: string;
  currency: string;
  // Bank Transfer specific
  va_numbers?: MidtransVANumber[];
  permata_va_number?: string;
  // E-Wallet specific
  actions?: MidtransAction[];
  // Card specific
  card_type?: string;
  bank?: string;
  approval_code?: string;
  masked_card?: string;
  // QRIS specific
  acquirer?: string;
  // Store specific
  store?: string;
  payment_code?: string;
}

export type MidtransTransactionStatusType =
  | 'capture'
  | 'settlement'
  | 'pending'
  | 'deny'
  | 'cancel'
  | 'expire'
  | 'failure'
  | 'refund'
  | 'partial_refund'
  | 'authorize';

export interface MidtransVANumber {
  bank: string;
  va_number: string;
}

export interface MidtransAction {
  name: string;
  method: string;
  url: string;
}

// Create Transaction Request (Snap)
export interface CreateSnapTransactionRequest {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details?: MidtransCustomer;
  item_details?: MidtransItemDetail[];
  callbacks?: {
    finish?: string;
    error?: string;
    pending?: string;
  };
  expiry?: {
    start_time?: string;
    unit: 'minute' | 'hour' | 'day';
    duration: number;
  };
  enabled_payments?: string[];
  credit_card?: {
    secure?: boolean;
    save_card?: boolean;
  };
}

export interface MidtransCustomer {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export interface MidtransItemDetail {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

// Webhook Notification Types
export interface MidtransNotification {
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_status: MidtransTransactionStatusType;
  fraud_status?: string;
  status_code: string;
  status_message: string;
  signature_key: string;
  transaction_time: string;
  settlement_time?: string;
  currency: string;
  // Additional fields based on payment type
  va_numbers?: MidtransVANumber[];
  permata_va_number?: string;
  payment_code?: string;
  store?: string;
  acquirer?: string;
}

// Payment Method Types
export type PaymentMethodType =
  | 'BANK_TRANSFER'
  | 'EWALLET'
  | 'RETAIL_OUTLET'
  | 'QRIS'
  | 'CREDIT_CARD';

export interface PaymentMethod {
  type: PaymentMethodType;
  name: string;
  code: string;
  icon?: string;
}

// Available Payment Methods in Indonesia via Midtrans
export const AVAILABLE_PAYMENT_METHODS: PaymentMethod[] = [
  // Bank Transfer (Virtual Account)
  { type: 'BANK_TRANSFER', name: 'BCA Virtual Account', code: 'bca_va', icon: 'bca' },
  { type: 'BANK_TRANSFER', name: 'BNI Virtual Account', code: 'bni_va', icon: 'bni' },
  { type: 'BANK_TRANSFER', name: 'BRI Virtual Account', code: 'bri_va', icon: 'bri' },
  { type: 'BANK_TRANSFER', name: 'Mandiri Bill', code: 'echannel', icon: 'mandiri' },
  { type: 'BANK_TRANSFER', name: 'Permata Virtual Account', code: 'permata_va', icon: 'permata' },

  // E-Wallets
  { type: 'EWALLET', name: 'GoPay', code: 'gopay', icon: 'gopay' },
  { type: 'EWALLET', name: 'ShopeePay', code: 'shopeepay', icon: 'shopeepay' },

  // Retail Outlets
  { type: 'RETAIL_OUTLET', name: 'Alfamart', code: 'alfamart', icon: 'alfamart' },
  { type: 'RETAIL_OUTLET', name: 'Indomaret', code: 'indomaret', icon: 'indomaret' },

  // QR Code
  { type: 'QRIS', name: 'QRIS', code: 'qris', icon: 'qris' },

  // Credit Card
  { type: 'CREDIT_CARD', name: 'Kartu Kredit/Debit', code: 'credit_card', icon: 'card' },
];

// Enabled payment methods for Midtrans Snap
export const ENABLED_PAYMENTS = [
  'credit_card',
  'bca_va',
  'bni_va',
  'bri_va',
  'echannel',
  'permata_va',
  'gopay',
  'shopeepay',
  'alfamart',
  'indomaret',
  'qris',
];

// Invoice Options
export interface InvoiceOptions {
  voucherId?: string;
  voucherDiscount?: number;
  payerEmail?: string;
  payerName?: string;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
  pendingRedirectUrl?: string;
  expiryDuration?: number; // in minutes
  durationMonths?: number;
}

// Tier change type for subscription transitions
export type TierChangeType = 'upgrade' | 'downgrade' | 'same' | 'new';

// Subscription Checkout
export interface CheckoutData {
  userId: string;
  tier: SubscriptionTier;
  durationMonths: 1 | 3 | 6 | 12;
  voucherCode?: string;
  payerEmail?: string;
  payerName?: string;
  changeType?: TierChangeType;
  scheduledForNextPeriod?: boolean;
}

export interface CheckoutResult {
  success: boolean;
  snapToken?: string;
  redirectUrl?: string;
  orderId?: string;
  error?: string;
  originalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
  discountPercent?: number; // Persentase diskon durasi (0-100)
  // For 100% discount vouchers - bypass payment gateway
  bypassPayment?: boolean;
  subscriptionActivated?: boolean;
}
