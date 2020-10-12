export class RabbitMqPublisher {
  constructor(opts) {
    this.channel = null;
    this.logger = opts.logger(module);
    this.rabbitMq = opts.rabbitMqClient;
    this.publishMessages = this.publishMessages.bind(this);
  }

  async publishMessages(queueName, msg) {
    this.channel = await this.rabbitMq.getChannel();

    this.channel.assertQueue(queueName, { durable: true }, (error) => {
      if (closeOnErr.call(this, error)) return;
      this.channel.sendToQueue(queueName, msg);
      this.logger.info(`Message published to ${queueName}`);
    });
  }
}

function closeOnErr(error) {
  if (!error) { return false; }
  this.logger.error('AMQP error : ' + error.message);
  this.rabbitMq.closeConnection();
  return true;
}
