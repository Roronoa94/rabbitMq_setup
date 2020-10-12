import express from 'express';
import container from './configureContainer';

container.configureContainer();
container.getContainer().resolve('consumer').startConsumer('rabbitMq-test');

const publisher = container.getContainer().resolve('publisher');

let app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

setInterval(async function() {
  await publisher.publishMessages('rabbitMq-test', Buffer.from('TEST_JOB'));
}, 5000);

module.exports = app;
