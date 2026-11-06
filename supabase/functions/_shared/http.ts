/**
 * HTTP helpers shared by all edge functions: JSON responses, CORS, and
 * error envelopes carrying a correlation id (surfaced by the apps' `error`
 * state so support can find the matching log line).
 */

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export function corsHeaders(req: Request, allowedOrigins: readonly string[]): Record<string, string> {
  const origin = req.headers.get("Origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

export function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

/** Wraps a handler with CORS preflight, method guard and uniform error handling. */
export function handle(
  name: string,
  allowedOrigins: readonly string[],
  handler: (req: Request, correlationId: string) => Promise<Response>,
): (req: Request) => Promise<Response> {
  return async (req) => {
    const cors = corsHeaders(req, allowedOrigins);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const correlationId = crypto.randomUUID();
    try {
      if (req.method !== "POST") throw new HttpError(405, "METHOD_NOT_ALLOWED", "Use POST");
      const response = await handler(req, correlationId);
      for (const [key, value] of Object.entries(cors)) response.headers.set(key, value);
      return response;
    } catch (error) {
      if (error instanceof HttpError) {
        if (error.status >= 500) {
          console.error(JSON.stringify({ fn: name, correlationId, code: error.code, message: error.message }));
        }
        return json({ error: { code: error.code, message: error.message, correlationId } }, error.status, cors);
      }
      console.error(JSON.stringify({
        fn: name,
        correlationId,
        code: "INTERNAL",
        message: error instanceof Error ? error.message : String(error),
      }));
      return json(
        { error: { code: "INTERNAL", message: "Something went wrong. Please retry.", correlationId } },
        500,
        cors,
      );
    }
  };
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "INVALID_JSON", "Request body must be JSON");
  }
}

/** Maps a Postgres error raised by our RPCs (e.g. 'AGE_VERIFICATION_REQUIRED') to HTTP. */
export function rpcError(error: { message: string; code?: string }): HttpError {
  const code = error.message.match(/^[A-Z0-9_]+$/) ? error.message : "DATABASE_ERROR";
  if (error.code === "42501") return new HttpError(403, code, error.message);
  if (error.code === "P0002") return new HttpError(404, code, error.message);
  if (error.code === "P0001" || error.code === "22023") return new HttpError(422, code, error.message);
  return new HttpError(500, "DATABASE_ERROR", error.message);
}
