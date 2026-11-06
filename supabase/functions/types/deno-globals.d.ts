// Minimal Deno globals so the edge functions can be type-checked by `tsc` in
// CI. Never imported by function code; the real Deno runtime provides these.
declare namespace Deno {
  interface Env {
    get(key: string): string | undefined;
  }
  const env: Env;
  function serve(handler: (request: Request) => Response | Promise<Response>): unknown;
}
