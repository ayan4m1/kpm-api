import { config } from 'dotenv';

config();

interface LogConfig {
  level?: string;
  timestampFormat?: string;
}

interface HttpConfig {
  port: number;
}

export const logging: LogConfig = {
  level: process.env.KPM_LOG_LEVEL ?? 'info',
  timestampFormat: process.env.KPM_LOG_TIME_FMT
};

export const http: HttpConfig = {
  port: parseInt(process.env.KPM_HTTP_PORT || '5005', 10)
};
