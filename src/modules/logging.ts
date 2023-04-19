import { Container, Logger, LoggerOptions, format, transports } from 'winston';
import { TransformableInfo } from 'logform';

import { logging as config } from './config';

const { combine, label: labelFn, prettyPrint, printf, timestamp } = format;

const loggers = new Map();
const container = new Container();

export const createLoggerConfig = (label?: string): LoggerOptions => {
  let formatter = (data: TransformableInfo) =>
    `[${data.level}][${data.label}] ${data.message}`;
  const formatters = [labelFn({ label: label })];

  if (config.timestampFormat) {
    formatters.push(timestamp({ format: config.timestampFormat }));
    formatter = (data) =>
      `${data.timestamp} [${data.level}][${data.label}] ${data.message}`;
  }

  formatters.push(prettyPrint(), printf(formatter));
  return {
    transports: [
      new transports.Console({
        level: config.level,
        format: combine(...formatters)
      })
    ]
  };
};

const registerLogger = (key: string, options: LoggerOptions): Logger =>
  container.add(key, options);

export const getLogger = (key: string, label: string = key): Logger => {
  if (!loggers.has(key)) {
    loggers.set(key, registerLogger(key, createLoggerConfig(label)));
  }

  return loggers.get(key);
};
