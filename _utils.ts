export type ReturnValue<T> = { res: Response, data: T|null }

export async function buildResponse<T>(
  res: Response
): Promise<ReturnValue<T>> {
  try {
    const clone = res.clone()
    const data = await clone.json();
    return { res, data: data as T };
  } catch (_e) {
    return { res, data: null };
  }
}


function camelToUnderscore(key: string) {
   var result = key.replace( /([A-Z])/g, " $1" );
   return result.split(' ').join('_').toLowerCase();
}

// recursively flatten complex objects into a stripe friendly form
function flattenObject(input: any, predicate: string): Array<[string, string]> {
  const inType = typeof input;
  if (inType === "number" || inType === "string") {
    return [[camelToUnderscore(predicate), `${input}`]];
  }

  if (inType === "object" && Array.isArray(inType)) {
    return (input as Array<any>).flatMap((val, i) => {
      return flattenObject(val, `${predicate}[${i}]`);
    });
  } else if (inType === "object") {
    return Object.entries(input as Record<any, any>)
      .filter(([_key, value]) => {
        return !!value
      })
      .flatMap(([key, value]) => {
        return flattenObject(value, `${predicate}[${key}]`);
      });
  }

  return [];
}

function isPrimitive(val: any) {
  return val !== Object(val);
}

export function urlEncodeObject(data: Record<string, any>): URLSearchParams {
  const toSerialize: Array<[string, string]> = [];
  for (const [key, value] of Object.entries(data)) {
    // if the value is undefined skip adding to request
    if (!value) continue

    if (isPrimitive(value)) {
      toSerialize.push([camelToUnderscore(key), value]);
    } else {
      const toAdd = flattenObject(value, key);
      toSerialize.push(...toAdd);
    }
  }
  return new URLSearchParams(toSerialize);
}

const baseUrl = new URL("https://api.stripe.com");

// tagged template for building stripe URI
export function uri(strings: TemplateStringsArray, id?: string): URL {
  const version = "/v1"
  return new URL(`${version}${strings[0]}${id ?? ""}`, baseUrl);
}

export function addExpand(
  toExpand: string[],
  params: URLSearchParams
): URLSearchParams {
  for (const exp of toExpand) {
    params.append(`expand[]`, exp);
  }
  return params;
}

export function validateArgs(args: Record<string, string>) {
  for (const arg of Object.entries(args)) {
    if (!arg) {
      throw new Error(
        `Could not initialize client, env vars not set. ${
          JSON.stringify(args)
        }`,
      );
    }
  }
  return args
}
