import {
  addExpand,
  buildResponse,
  ReturnValue,
  uri,
  urlEncodeObject,
validateArgs,
} from "./_utils.ts";
import type {
  CheckoutSessionsCreateInput,
  CreateSubscriptionInput,
  ListAllPricesInput,
  PortalSessionsCreateInput,
  UpdateCustomerInput,
  UpdatePriceInput,
} from "./stripe.types.ts";

export const getStripeClient = (args: { stripeKey: string }) => {
  const { stripeKey } = validateArgs(args)

  async function authedFetch<T = Record<string, any>>(
    url: URL,
    opts?: RequestInit
  ): Promise<ReturnValue<T>> {
    // build authentication header
    const headers = {
      Authorization: `Basic ${btoa(`${stripeKey}:`)}`,
      "content-type": "application/x-www-form-urlencoded",
    };
    const newOpts = Object.assign(opts || {}, { headers });
    const res = await fetch(url, newOpts);
    return await buildResponse<T>(res);
  }

  // return the client object
  return {
    checkout: {
      sessions: {
        create: (input: CheckoutSessionsCreateInput) => {
          return authedFetch(uri(`/checkout/sessions`), {
            method: "POST",
            body: urlEncodeObject(input),
          });
        },
      },
    },
    customers: {
      get: ({ id }: { id: string }) => authedFetch(uri(`/customers/${id}`)),
      update: ({ id, ...args }: UpdateCustomerInput) => {
        return authedFetch(uri(`/customers/${id}`), {
          method: "POST",
          body: urlEncodeObject(args)
        })
      }
    },
    billingPortal: {
      sessions: {
        create: (input: PortalSessionsCreateInput) => {
          return authedFetch(uri(`/billing_portal/sessions`), {
            method: "POST",
            body: urlEncodeObject(input),
          });
        },
      },
    },
    prices: {
      list: (input: ListAllPricesInput, expand: Array<"data.product">) => {
        const url = uri(`/prices`);
        url.search = addExpand(expand, urlEncodeObject(input)).toString();
        return authedFetch(url);
      },
      update: ({ id, ...args }: UpdatePriceInput) => {
        return authedFetch(uri(`/prices/${id}`), {
          method: "POST",
          body: urlEncodeObject(args),
        });
      },
    },
    subscriptions: {
      create: (input: CreateSubscriptionInput) => {
        return authedFetch(uri(`/subscriptions`), {
          method: "POST",
          body: urlEncodeObject(input),
        });
      },
    },
  };
};

export type StripeClient = ReturnType<typeof getStripeClient>;
