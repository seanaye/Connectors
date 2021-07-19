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
  "cancel_url": string;
  mode: SessionMode;
  "payment_method_types": PaymentMethodTypes[];
  "success_url": string;
  "client_reference_id"?: string;
  customer?: string;
  "customer_email"?: string;
  "line_items": LineItem[];
  "allow_promotion_codes": boolean;
}
