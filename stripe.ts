import { buildResponse, ReturnValue } from "./_utils.ts";
import type { CheckoutSessionsCreateInput } from "./stripe.types.ts";

// recursively flatten complex objects into a stripe friendly form
function flattenObject(input: any, predicate: string): Array<[string, string]> {
  const inType = typeof input
  if (inType === "number" || inType === "string") {
    return [[predicate, `${input}`]]
  }

  if (inType === "object" && Array.isArray(inType)) {
    return (input as Array<any>).flatMap((val, i) => {
      return flattenObject(val, `${predicate}[${i}]`)
    })
  } else if (inType === "object") {
    return Object.entries(input as Record<any, any>).flatMap(([key, value]) => {
      return flattenObject(value, `${predicate}[${key}]`)
    })
  }

  return []
}

function isPrimitive(val: any) {
  return val !== Object(val)
}

function urlEncodeObject(data: Record<string, any>): URLSearchParams {
  const toSerialize: Array<[string, string]> = []
  for (const [key, value] of Object.entries(data)) {
    if (isPrimitive(value)) {
      toSerialize.push([key, value])
    } else {
      const toAdd = flattenObject(value, key)
      toSerialize.push(...toAdd)
    }
  }
  return new URLSearchParams(toSerialize)
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
          const body = urlEncodeObject(input)
          console.log({ input })
          console.log({ body })
          return authedFetch(`/checkout/sessions`, {
            method: "POST",
            body
          });
        },
      },
    },
    customer: (customerId: string) => authedFetch(`/customers/${customerId}`),
  };
};

export type StripeClient = ReturnType<typeof getStripeClient>;
