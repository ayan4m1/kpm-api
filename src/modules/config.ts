import { config } from 'dotenv';

config();

interface LogConfig {
  level?: string;
  timestampFormat?: string;
}

interface HttpConfig {
  port: number;
}

interface TokenConfig {
  saltRounds: number;
  lifetimeMins: number;
}

export const logging: LogConfig = {
  level: process.env.KPM_LOG_LEVEL ?? 'info',
  timestampFormat: process.env.KPM_LOG_TIME_FMT
};

export const http: HttpConfig = {
  port: parseInt(process.env.KPM_HTTP_PORT || '5005', 10)
};

export const token: TokenConfig = {
  saltRounds: parseInt(process.env.KPM_TOKEN_ROUNDS || '8', 10),
  lifetimeMins: parseInt(process.env.KPM_TOKEN_LIFETIME_MINS || '20', 10)
};
