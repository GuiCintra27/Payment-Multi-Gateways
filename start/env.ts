/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  // App
  APP_KEY: Env.schema.secret(),

  // Database
  DB_HOST: Env.schema.string(),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),

  // Gateways
  GATEWAY1_URL: Env.schema.string({ format: 'url', tld: false }),
  GATEWAY2_URL: Env.schema.string({ format: 'url', tld: false }),
  GATEWAY1_EMAIL: Env.schema.string.optional(),
  GATEWAY1_TOKEN: Env.schema.string.optional(),
  GATEWAY2_AUTH_TOKEN: Env.schema.string.optional(),
  GATEWAY2_AUTH_SECRET: Env.schema.string.optional(),

  // Telemetry
  OTEL_TRACING_ENABLED: Env.schema.boolean.optional(),
  OTEL_DIAGNOSTICS_ENABLED: Env.schema.boolean.optional(),
  OTEL_SERVICE_NAME: Env.schema.string.optional(),
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: Env.schema.string.optional(),
})
