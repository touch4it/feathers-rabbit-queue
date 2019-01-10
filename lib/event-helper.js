module.exports = {
  eventDelimiter: '::',

  /**
   * Parse event name
   *
   * @param  {string} eventName Name of incoming event
   * @return {object}           Service path with service method
   */
  parseEventName(eventName) {
    const [path, method] = eventName.split(module.exports.eventDelimiter);
    return {path, method};
  },

  /**
   * Create event name
   *
   * @param  {string} path   Service path
   * @param  {string} method Service method
   * @return {string}        Event name
   */
  createEventName(path, method) {
    path = path || '';
    method = method || '';
    return path + module.exports.eventDelimiter + method;
  },

  /**
   * Add event name to service options
   *
   * @param  {string} path         Service path
   * @param  {string} method       Service method
   * @param  {object} options = {} Service options
   * @return {object}              Service options
   */
  addEventNameToOptions(path, method, options = {}) {
    options.headers = options.headers || {};
    options.headers.eventType = module.exports.createEventName(path, method);
    return options;
  },

  /**
   * Create RabbitMQ message to rabbit
   *
   * @param  {string} rabbit       RabbitMQ connection
   * @param  {string} queueName    RabbitMQ queue name
   * @param  {object} options      Message options
   * @return {Promise}             RabbitMQ promise
   */
  createRabbitMQMessage(rabbit, queueName, {path, method, body, query, replyHandler, errorHandler}) {
    return rabbit
      .getReply(
        queueName,
        body,
        module.exports.addEventNameToOptions(path, method, {headers: {query}})
      )
      .then(replyHandler)
      .catch(errorHandler);
  }
};
