export class RabbitMqConsumer {
  constructor(opts) {
    this.channel = null;
    this.logger = opts.logger(module);
    this.rabbitMq = opts.rabbitMqClient;
    this.service = opts.service;
    this.startConsumer = this.startConsumer.bind(this);
    this.processMsg = this.processMsg.bind(this);
  }

  async startConsumer(queueName) {
    this.channel = await this.rabbitMq.getChannel();

    this.channel.prefetch(10);
    this.channel.assertQueue(queueName, { durable: true }, (error) => {
      if (closeOnErr.call(this, error)) return;
      this.channel.consume(queueName, this.processMsg, { noAck: false });
      this.logger.info(`${queueName} is started`);
    });
  }

  processMsg(msg) {
    work.call(this, msg, (ok) => {
      try {
        if (ok) { this.channel.ack(msg); }
      } catch (error) {
        closeOnErr.call(this, error);
      }
    });
  }
}

function work(msg, ack) {
  const job = msg.content.toString();
  if (job === 'TEST_JOB') {
    this.service.performTask((isProcessed) => {
      isProcessed ? this.logger.info('Job Status : Successful') : this.logger.info('Job Status : Unsuccessful');
    });
  } else {
    this.logger.info('No matching job for : ' + msg.content.toString());
  }
  ack(true);
}

function closeOnErr(error) {
  if (!error) { return false; }
  this.logger.error('AMQP error : ' + error.message);
  this.rabbitMq.closeConnection();
  return true;
}
