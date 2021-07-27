type SessionMode = "payment" | "setup" | "subscription";

type PaymentMethodTypes =
  | "alipay"
  | "card"
  | "ideal"
  | "fpx"
  | "bacs_debit"
  | "bancontact"
  | "giropay"
  | "p24"
  | "eps"
  | "sofort"
  | "sepa_debit"
  | "grabpay"
  | "afterpay_clearpay"
  | "acss_debit"
  | "wechat_pay"
  | "boleto"
  | "oxxo";

interface LineItem {
  price: string;
  description?: string;
  quantity: number;
}

export interface CheckoutSessionsCreateInput {
  cancelUrl: string;
  mode: SessionMode;
  paymentMethodTypes: PaymentMethodTypes[];
  successUrl: string;
  clientReferenceId?: string;
  customer?: string;
  customerEmail?: string;
  lineItems: LineItem[];
  allowPromotionCodes: boolean;
}

export interface PortalSessionsCreateInput {
  customer: string;
  returnUrl: string;
}

export interface ListAllPricesInput {
  active?: boolean;
  currency?: string;
  product?: string;
  type?: "recuring" | "one_time";
  limit?: number;
  startingAfter?: string;
}

export interface UpdatePriceInput {
  active?: boolean;
  metadata?: Record<string, string>;
  nickname?: string;
  id: string;
}

export interface CreateSubscriptionInput {
  customer: string;
  items: Array<{
    price: string;
    metadata?: Record<string, string>;
    quantity?: number;
  }>;
  coupon?: string;
  promotionCode?: string;
  trialPeriodDays?: number;
}

export interface UpdateCustomerInput {
  id: string;
  description?: string;
  email?: string;
  metadata?: Record<string, string>;
  name?: string;
}

type SubscriptionStatus =
  | "active"
  | "past_due"
  | "unpaid"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "all"
  | "ended";

export interface ListSubscriptionsInput {
  customer?: string;
  price?: string;
  status?: SubscriptionStatus;
  limit?: number;
}
