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
    return Object.entries(input as Record<any, any>).flatMap(([key, value]) => {
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

export function uri(path: string, version = "/v1"): URL {
  return new URL(`${version}${path}`, baseUrl);
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
