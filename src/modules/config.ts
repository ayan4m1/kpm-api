import { config } from 'dotenv';

config();

interface LogConfig {
  level?: string;
  timestampFormat?: string;
}

interface HttpConfig {
  port: number;
}

interface AuthConfig {
  uiUrl: string;
}

interface TokenConfig {
  saltRounds: number;
  lifetimeMins: number;
}

interface GithubConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  retries: number;
}

interface SessionConfig {
  secret: string;
  maxCookieAgeHours: number;
}

interface DatabaseConfig {
  connectionString: string;
}

export const logging: LogConfig = {
  level: process.env.KPM_LOG_LEVEL ?? 'info',
  timestampFormat: process.env.KPM_LOG_TIME_FMT
};

export const http: HttpConfig = {
  port: parseInt(process.env.KPM_HTTP_PORT ?? '5005', 10)
};

export const token: TokenConfig = {
  saltRounds: parseInt(process.env.KPM_TOKEN_ROUNDS ?? '8', 10),
  lifetimeMins: parseInt(process.env.KPM_TOKEN_LIFETIME_MINS ?? '20', 10)
};

export const auth: AuthConfig = {
  uiUrl: process.env.KPM_AUTH_UI_URL
};

export const github: GithubConfig = {
  clientId: process.env.KPM_GH_CLIENT_ID,
  clientSecret: process.env.KPM_GH_CLIENT_SECRET,
  callbackUrl: process.env.KPM_GH_CALLBACK_URL,
  retries: parseInt(process.env.KPM_GH_RETRIES ?? '10', 10)
};

export const session: SessionConfig = {
  secret: process.env.KPM_SESSION_SECRET,
  maxCookieAgeHours: parseInt(
    process.env.KPM_SESSION_MAX_COOKIE_AGE_HOURS ?? '24',
    10
  )
};

export const database: DatabaseConfig = {
  connectionString: process.env.KPM_DB_CONNECTION_STRING
};
