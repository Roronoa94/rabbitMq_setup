export class Service {
  constructor(opts) {
    this.logger = opts.logger(module);
  }

  performTask(isProcessed) {
    this.logger.debug('Service Layer Called');

    isProcessed(true);
  }
}
