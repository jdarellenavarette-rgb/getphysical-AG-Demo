import * as Sentry from "@sentry/nextjs";
import { monitoringOptions } from "./lib/monitoring";

/** Runs once when a server or edge instance starts. */
export function register() {
  Sentry.init(monitoringOptions);
}

/** Reports errors thrown while rendering a page or running a Server Action. */
export const onRequestError = Sentry.captureRequestError;
