// Configuration management

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  nodeEnv: z.enum(['development', 'staging', 'production']).default('development'),
  port: z.coerce.number().default(8080),
  gcp: z.object({
    projectId: z.string(),
    region: z.string().default('us-central1'),
    storageBucket: z.string(),
  }),
  db: z.object({
    host: z.string(),
    port: z.coerce.number().default(5432),
    name: z.string(),
    user: z.string(),
    password: z.string(),
    ssl: z.coerce.boolean().default(false),
  }),
  auth: z.object({
    jwtSecret: z.string().min(32),
    jwtExpiration: z.string().default('7d'),
  }),
  cors: z.object({
    allowedOrigins: z.string().transform((val) => val.split(',')),
  }),
  rateLimit: z.object({
    windowMs: z.coerce.number().default(900000),
    maxRequests: z.coerce.number().default(100),
  }),
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  }),
  api: z.object({
    openaiKey: z.string().optional(),
    googleSpeechKey: z.string().optional(),
  }),
});

export const config = configSchema.parse({
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  gcp: {
    projectId: process.env.GCP_PROJECT_ID,
    region: process.env.GCP_REGION,
    storageBucket: process.env.STORAGE_BUCKET,
  },
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiration: process.env.JWT_EXPIRATION,
  },
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS,
  },
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS,
    maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS,
  },
  logging: {
    level: process.env.LOG_LEVEL,
  },
  api: {
    openaiKey: process.env.OPENAI_API_KEY,
    googleSpeechKey: process.env.GOOGLE_SPEECH_API_KEY,
  },
});

export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
