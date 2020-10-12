import logger from './lib/logger/logger';
import { createContainer, asClass, asValue } from 'awilix/lib/awilix';
import { RabbitMqClient } from './lib/rabbitMqClient/rabbitMqClient';
import rabbitMqConfig from './config/rabbitMqConfig';
import { RabbitMqConsumer } from './consumer/rabbitMqConsumer';
import { RabbitMqPublisher } from './publisher/rabbitMqPublisher';
import { Service } from './service/Service';

const dependencyInjector = require('awilix/lib/awilix');
const container = createContainer({
  injectionMode: dependencyInjector.InjectionMode.PROXY
});

module.exports = {

  configureContainer() {
    container.register({
      rabbitMqClient: asClass(RabbitMqClient).singleton(),
      consumer: asClass(RabbitMqConsumer).scoped(),
      publisher: asClass(RabbitMqPublisher).scoped(),
      service: asClass(Service).scoped(),
      rabbitMqConfig: asValue(rabbitMqConfig),
      logger: asValue(logger)
    });
    return container;
  },

  getContainer() {
    return container;
  }
};
