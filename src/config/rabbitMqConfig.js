import logger from '../lib/logger/logger';

const env = process.env.NODE_ENV || 'development';

let production = {};

const development = {
  'url': 'amqp://localhost',
  logging: (msg) => logger(module).info(msg)
};

if (env === 'production') {
  production = {
    'url': 'amqp://localhost'
  };
}

const config = {
  development,
  production
};

module.exports = config;
