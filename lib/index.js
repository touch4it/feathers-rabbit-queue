const {Rabbit} = require('rabbit-queue');
const routing = require('@feathersjs/transport-commons/lib/routing');
const {ServiceQueueHandler} = require('./queue-handler');
const {
  addEventNameToOptions,
  parseEventName,
  createEventName,
  createRabbitMQMessage
} = require('./event-helper');

/**
 * Configure RabbitMQ to Feathers
 *
 * @param  {object} settings Connection, Queue settings
 * @return {function}        Feathers configure function
 */
function configure(settings) {
  return function () {
    const app = this;
    app.configure(routing());
    settings.queue = settings.queue || {};
    settings.logger = settings.logger || console;

    /**
     * RabbitMQ connection instance
     */
    const rabbit = new Rabbit(settings.uri, {
      prefetch: settings.prefetch || 1,
      replyPattern: true,
      scheduledPublish: false,
      prefix: settings.prefix || '',
      socketOptions: settings.socketOptions || {}
    });

    /**
     * Custom queue handler
     */
    const serviceQueueHandler = new ServiceQueueHandler(
      settings.queueName,
      rabbit,
      {
        retries: settings.queue.retries || 3,
        retryDelay: settings.queue.retryDelay || 1000,
        logEnabled:
          settings.queue.logEnabled === undefined ?
            true :
            settings.queue.logEnabled,
        scope: 'SINGLETON',
        createAndSubscribeToQueue: true
      },
      {
        app,
        logger: settings.logger
      }
    );

    /**
     * Create RabbitMQ Promise message
     *
     * @param  {string} { queueName = settings.queueName Transfer RabbitMQ queue name
     * @param  {string} path                             Service path
     * @param  {string} method                           Service method
     * @param  {object} body = {} }                      Service body
     * @return {Promise}                                 Created promise message
     */
    function createMessage({queueName = settings.queueName, path, method, body = {}}) {
      return new Promise((resolve, reject) => {
        return createRabbitMQMessage(rabbit, queueName, {
          queueName,
          path,
          method,
          body,
          replyHandler: resolve,
          errorHandler: reject
        });
      });
    }

    /**
     * RabbitMQ On connected handler
     */
    rabbit.on('connected', () => {
      settings.logger.info('Connected to RabbitMQ');
    });

    /**
     * RabbitMQ On disconnected handler
     */
    rabbit.on('disconnected', (err = new Error('Rabbitmq Disconnected')) => {
      settings.logger.error('Disconnected from RabbitMQ', err);
      setTimeout(() => rabbit.reconnect(), settings.reconnectDelay || 1000);
    });

    /**
     * Feathers configure RabbitMQ to APP
     */
    app.rabbit = {
      connection: rabbit,
      queue: serviceQueueHandler,
      createMessage
    };
  };
}

module.exports = {
  configure,
  addEventNameToOptions,
  parseEventName,
  createEventName,
  createRabbitMQMessage
};
