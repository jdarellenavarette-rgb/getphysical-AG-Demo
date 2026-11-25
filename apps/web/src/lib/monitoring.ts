/**
 * Error monitoring settings shared by the browser, the server and the edge runtime.
 *
 * Monitoring is off until NEXT_PUBLIC_SENTRY_DSN is set, so local runs, tests and previews
 * without it send nothing. A DSN only allows sending events to the project; it is not a secret.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

export const monitoringOptions = {
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  // People's names, emails and addresses stay out of reports: no cookies, no request bodies, no IPs.
  sendDefaultPii: false,
  // One request in ten is timed, enough to see slow pages without paying to trace everything.
  tracesSampleRate: 0.1,
};
