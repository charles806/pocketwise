import * as Sentry from "@sentry/node";


  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.2,
  });


export { Sentry };
