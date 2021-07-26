export enum SessionMode {
  payment = "payment",
  setup = "setup",
  subscription = "subscription"
}

export enum PaymentMethodTypes {
  alipay = "alipay",
  card = "card",
  ideal = "ideal",
  fpx = "fpx",
  bacsDebit = "bacs_debit",
  bancontact = "bancontact",
  giropay = "giropay",
  p24 = "p24",
  eps = "eps",
  sofort = "sofort",
  sepaDebit = "sepa_debit",
  grabpay = "grabpay",
  afterpayClearpay = "afterpay_clearpay",
  acssDebit = "acss_debit",
  wechatPay = "wechat_pay",
  boleto = "boleto",
  oxxo = "oxxo"
}

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
  type?: "recuring"|"one_time"
  limit?: number
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
    metadata?: Record<string, string>
    quantity?: number;
  }>;
  coupon?: string;
  trialPeriodDays?: number;
}
