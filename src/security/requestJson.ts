export class RequestBodyError extends Error {
  constructor(public status: number) { super("Invalid request body"); }
}
export async function limitedJson(req: Request, maxBytes: number) {
  if (Number(req.headers.get("content-length")) > maxBytes) throw new RequestBodyError(413);
  if (!req.body) throw new RequestBodyError(400);
  const reader = req.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) { await reader.cancel(); throw new RequestBodyError(413); }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return JSON.parse(text);
  } catch (error) {
    if (error instanceof RequestBodyError) throw error;
    throw new RequestBodyError(400);
  } finally { reader.releaseLock(); }
}
