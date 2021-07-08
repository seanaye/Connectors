import { buildResponse, ReturnValue } from "./_utils.ts";

export const getStripeClient = ({ stripeKey }: { stripeKey?: string }) => {
  if (!stripeKey) {
    throw new Error(`No stripe key provided ${JSON.stringify({ stripeKey })}`);
  }
  const baseUrl = "https://api.stripe.com/v1";
  const authedFetch = async <T = Record<string, any>>(
    url: string,
    opts?: RequestInit
  ): ReturnValue<T> => {
    // build authentication header
    const headers = { Authorization: `Basic ${btoa(`${stripeKey}:`)}` };
    const newOpts = Object.assign(opts || {}, { headers });
    const res = await fetch(url, newOpts);
    return await buildResponse<T>(res)
  };

  return {
    customer: (customerId: string) =>
      authedFetch(`${baseUrl}/customers/${customerId}`),
  };
};

export type StripeClient = ReturnType<typeof getStripeClient>
