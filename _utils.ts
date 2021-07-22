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
