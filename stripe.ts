import { buildResponse, ReturnValue } from "./_utils.ts";
import type {
  CheckoutSessionsCreateInput,
  ListAllPricesInput,
  PortalSessionsCreateInput,
} from "./stripe.types.ts";

// recursively flatten complex objects into a stripe friendly form
function flattenObject(input: any, predicate: string): Array<[string, string]> {
  const inType = typeof input;
  if (inType === "number" || inType === "string") {
    return [[predicate, `${input}`]];
  }

  if (inType === "object" && Array.isArray(inType)) {
    return (input as Array<any>).flatMap((val, i) => {
      return flattenObject(val, `${predicate}[${i}]`);
    });
  } else if (inType === "object") {
    return Object.entries(input as Record<any, any>).flatMap(([key, value]) => {
      return flattenObject(value, `${predicate}[${key}]`);
    });
  }

  return [];
}

function isPrimitive(val: any) {
  return val !== Object(val);
}

function urlEncodeObject(data: Record<string, any>): URLSearchParams {
  const toSerialize: Array<[string, string]> = [];
  for (const [key, value] of Object.entries(data)) {
    if (isPrimitive(value)) {
      toSerialize.push([key, value]);
    } else {
      const toAdd = flattenObject(value, key);
      toSerialize.push(...toAdd);
    }
  }
  return new URLSearchParams(toSerialize);
}

const baseUrl = new URL("https://api.stripe.com/v1");

function makeURL(path: string): URL {
  return new URL(path, baseUrl);
}

function addExpand(
  toExpand: string[],
  params: URLSearchParams
): URLSearchParams {
  for (const exp of toExpand) {
    params.append(`expand[]`, exp);
  }
  return params;
}

export const getStripeClient = ({ stripeKey }: { stripeKey?: string }) => {
  if (!stripeKey) {
    throw new Error(`No stripe key provided ${JSON.stringify({ stripeKey })}`);
  }

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
          return authedFetch(makeURL(`/checkout/sessions`), {
            method: "POST",
            body: urlEncodeObject(input),
          });
        },
      },
    },
    customer: (customerId: string) =>
      authedFetch(makeURL(`/customers/${customerId}`)),
    billingPortal: {
      sessions: {
        create: (input: PortalSessionsCreateInput) => {
          return authedFetch(makeURL(`/billing_portal/sessions`), {
            method: "POST",
            body: urlEncodeObject(input),
          });
        },
      },
    },
    prices: {
      list: (input: ListAllPricesInput, expand: Array<"product">) => {
        const url = makeURL(`/prices`);
        url.search = addExpand(expand, urlEncodeObject(input)).toString();
        return authedFetch(url);
      },
    },
  };
};

export type StripeClient = ReturnType<typeof getStripeClient>;
