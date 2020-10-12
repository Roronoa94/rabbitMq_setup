import amqp from 'amqplib/callback_api';
const env = process.env.NODE_ENV || 'development';

export class RabbitMqClient {
  constructor(opts) {
    this.connection = null;
    this.channel = null;
    this.logger = opts.logger(module);
    this.config = opts.rabbitMqConfig[env];
    this.establishConnection = this.establishConnection.bind(this);
    this.formChannel = this.formChannel.bind(this);
    this.getChannel = this.getChannel.bind(this);
    this.closeConnection = this.closeConnection.bind(this);
  }

  establishConnection() {
    return new Promise((resolve, reject) => {
      amqp.connect(this.config.url, (error, conn) => {
        if (error) {
          this.logger.error('AMQP conn error : ' + error.message + '\nRetrying to establish connection ...');
          return setTimeout(this.establishConnection, 1000);
        }
        conn.on('error', (error) => {
          if (error.message !== 'Connection closing') {
            this.logger.error('AMQP conn error', error.message);
          }
        });
        conn.on('close', () => {
          this.logger.error('AMQP reconnecting ...');
          return setTimeout(this.establishConnection, 1000);
        });
        this.logger.debug('AMQP connection established');
        this.connection = conn;
        resolve(this.connection);
      });
    });
  }

  async formChannel() {
    if (!this.connection) {
      await this.establishConnection();
    }
    return new Promise((resolve, reject) => {
      this.connection.createChannel((error, channel) => {
        if (closeOnErr.call(this, error)) {
          this.logger.error('AMQP channel error : ' + error.message + '\nRetrying to create channel ...');
          return setTimeout(this.formChannel, 1000);
        };
        channel.on('error', (err) => {
          this.logger.error('AMQP channel error : ' + err.message);
        });
        channel.on('close', () => {
          this.logger.info('AMQP channel closed');
          return setTimeout(this.formChannel, 1000);
        });
        this.logger.debug('AMQP channel formed');
        this.channel = channel;
        resolve(this.channel);
      });
    });
  }

  async getChannel() {
    if (!this.channel) {
      await this.formChannel();
    }
    return this.channel;
  }

  closeConnection() {
    if (this.connection) {
      this.logger.debug('RabbitMq: Closing connection..');
      this.connection.close();
    }
  }
}

function closeOnErr(error) {
  if (!error) { return false; }
  this.logger.error('AMQP error : ' + error);
  this.connection.close();
  return true;
}
