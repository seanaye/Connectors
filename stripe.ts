export const getStripeClient = (stripeKey: string) => {
  const baseUrl = "https://api.stripe.com/v1";
  const authedFetch = async <T = Record<string, any>>(
    url: string,
    opts?: RequestInit
  ): Promise<[number, T]> => {
    // build authentication header
    const headers = { Authorization: `Basic ${btoa(`${stripeKey}:`)}` };
    const newOpts = Object.assign(opts || {}, { headers });
    const res = await fetch(url, newOpts);
    const body = await res.json();
    return [res.status, body as T];
  };

  return {
    customer: (customerId: string) =>
      authedFetch(`${baseUrl}/customers/${customerId}`),
  };
};
