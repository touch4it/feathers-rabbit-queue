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
  createRabbitMQMessage(rabbit, queueName, {path, method, body, query, data, replyHandler, errorHandler}) {
    module.exports.attributeIsRequired('queueName', queueName, ['']);
    return rabbit
      .getReply(
        queueName,
        body,
        module.exports.addEventNameToOptions(path, method, {headers: {query, data}})
      )
      .then(replyHandler)
      .catch(errorHandler);
  },

  /**
   * Attribute is required
   *
   * @param  {string} name         Attribute name
   * @param  {any}    value        Attribute value
   * @param  {Array}  badValues    Attribute bad values
   */
  attributeIsRequired(name, value, badValues = []) {
    if (value === undefined || badValues.includes(value)) {
      throw new Error(`Attribute '${name}' is required, current value is '${value}'`);
    }
  }
};
