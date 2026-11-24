import * as Sentry from "@sentry/nextjs";
import { monitoringOptions } from "./lib/monitoring";

// Errors in the browser. Session replay is deliberately not enabled: it would record what people
// type and see, which the privacy notice does not cover.
Sentry.init(monitoringOptions);

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
