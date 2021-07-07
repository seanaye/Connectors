export const getStripeClient = ({ stripeKey }: { stripeKey?: string }) => {
  if (!stripeKey) {
    throw new Error(`No stripe key provided ${JSON.stringify({ stripeKey })}`);
  }
  const baseUrl = "https://api.stripe.com/v1";
  const authedFetch = async <T = Record<string, any>>(
    url: string,
    opts?: RequestInit
  ): Promise<{ data: T, res: Response }> => {
    // build authentication header
    const headers = { Authorization: `Basic ${btoa(`${stripeKey}:`)}` };
    const newOpts = Object.assign(opts || {}, { headers });
    const res = await fetch(url, newOpts);
    const body = await res.json();
    return { res, data: body as T };
  };

  return {
    customer: (customerId: string) =>
      authedFetch(`${baseUrl}/customers/${customerId}`),
  };
};

export type StripeClient = ReturnType<typeof getStripeClient>
