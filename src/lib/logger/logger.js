import winston from 'winston';
import path from 'path';
const format = winston.format;
const { combine, timestamp, errors, label, colorize, printf } = format;
const logLevel = process.env.LOG_LEVEL || 'debug';
require('winston-daily-rotate-file/index');

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'green'
};

const myFormat = printf(info => {
  return `${info.timestamp} ${info.label} ${info.level}: ${info.message ? JSON.stringify(info.message, null, 2) : ''}`;
});

const options = {
  info: {
    level: 'info',
    datePattern: 'YYYY-MM-DD',
    filename: path.join(__dirname, '../../logs/logs-%DATE%.log'),
    handleExceptions: false,
    json: true,
    maxsize: 5242880,
    maxFiles: 5
  },
  console: {
    level: logLevel,
    handleExceptions: true,
    json: false,
    format: combine(
      colorize({ all: true })
    )
  }
};

const getLabel = function(callingModule) {
  const path = callingModule.filename;
  return path.includes('src') ? 'src' + path.split('src').pop() : path.substring(path.lastIndexOf('/') + 1);
};

winston.addColors(colors);

module.exports = function(callingModule) {
  return new winston.createLogger({
    format: combine(
      label({ label: getLabel(callingModule) }),
      errors({ stack: false }),
      timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      myFormat
    ),
    transports: [
      new winston.transports.DailyRotateFile(options.info),
      new winston.transports.Console(options.console)
    ],
    exitOnError: true
  });
};
