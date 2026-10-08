import pino from 'pino';
import { env } from '../../config/env.js';

const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  'req.body.password',
  'req.body.token',
  'req.body.refreshToken',
  'req.body.apiKey',
  'req.body.clientSecret',
  'res.headers["set-cookie"]',
  '*.password',
  '*.refreshToken',
  '*.accessToken',
  '*.apiKey',
  '*.apiSecret',
  '*.secret',
  '*.encryptionKey',
  '*.clientSecret',
  '*.encrypted',
  '*.refresh_token',
  '*.access_token',
  '*.privateKey',
];

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: { paths: REDACT_PATHS, censor: '[REDACTED]' },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label: string) => ({ level: label }),
    bindings: () => ({}),
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  base: { service: 'shortforge-api' },
  transport: isDevTransport(),
});

function isDevTransport(): any {
  if (env.NODE_ENV === 'development') {
    return {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'HH:MM:ss.l', ignore: 'pid,hostname,service' },
    };
  }
  return undefined;
}

export function childLogger(bindings: Record<string, unknown>) {
  return logger.child(bindings);
}

export default logger;
