import { buildResponse, ReturnValue } from "./_utils.ts";
import type { CheckoutSessionsCreateInput } from "./stripe.types.ts";

function serializeObject(data: Record<string, any>): string {
  return Object.keys(data)
    .map((key) => {
      return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
    })
    .join("&");
}

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
    const headers = {
      Authorization: `Basic ${btoa(`${stripeKey}:`)}`,
      "content-type": "application/x-www-form-urlencoded",
    };
    const newOpts = Object.assign(opts || {}, { headers });
    console.log({ body: newOpts?.body });
    console.log(newOpts?.body)
    const res = await fetch(`${baseUrl}${url}`, newOpts);
    return await buildResponse<T>(res);
  };

  return {
    checkout: {
      sessions: {
        create: (input: CheckoutSessionsCreateInput) => {
          return authedFetch(`/checkout/sessions`, {
            method: "POST",
            body: serializeObject(input)
          });
        },
      },
    },
    customer: (customerId: string) => authedFetch(`/customers/${customerId}`),
  };
};

export type StripeClient = ReturnType<typeof getStripeClient>;
