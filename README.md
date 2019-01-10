# feathers-rabbit-queue

A [Feathers](https://feathersjs.com) amqp service adapter for [Rabbit Queue](https://github.com/Workable/rabbit-queue#readme).

```bash
$ npm install --save feathers-rabbit-queue
```

## API

### `configure(options)`

Configure RabbitMQ with [Feathers application](https://feathersjs.com) as new provider.

__Options:__

- `uri` (**required**) - Connection uri to RabbitMQ
- `prefetch` (*optional*, default: `1`) - Prefetch from queue
- `prefix` (*optional*) - Prefix all queues with an application name
- `socketOptions` (*optional*, default: `{}`) - Socket Options will be passed as a second param to amqp.connect and from there to the socket library (net or tls)
- `queue` (*optional*, default: `{retries: 3, retryDelay: 1000, logEnabled: true}`) - Queue options
- `reconnectDelay` (*optional*, default: `1000`) - Delay before next reconnect attempt
- `logger` (*optional*, default: `console`) - Output logger


## Example

Here's a example of configuration.

```js
const compress = require('compression');
const helmet = require('helmet');
const cors = require('cors');

const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');
const rabbitConfigure = require('feathers-rabbit-queue').configure;

const app = express(feathers());

// Load app configuration
app.configure(configuration());
// Enable security, CORS, compression, favicon and body parsing
app.use(helmet());
app.use(cors());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Set up Plugins and providers
app.configure(express.rest());
app.configure(
  rabbitConfigure({
    uri: 'amqp://user:pass@host:5672',
    queueName: 'custom-queue-name',
    logger: console
  })
);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({logger}));
```

Send custom message through RabbitMQ.

Create
```js
async function customFunctionWithAppReference(app) {
  try {
    const result = await app.rabbit.createMessage({path: 'path/to/somewhere', method: 'create', body: {}});
    console.log('Got result:', result);
  } catch (error) {
    console.log('Got error:', error);
  }
}
```

Remove
```js
async function customFunctionWithAppReference(app) {
  try {
    const result = await app.rabbit.createMessage({
      path: 'path/to/somewhere',
      method: 'create',
      body: 'id-to-remove',
      query: {
        attribute: 'value'
      }
    });
    console.log('Got result:', result);
  } catch (error) {
    console.log('Got error:', error);
  }
}
```

Message can be send to another Queue.

```js
async function customFunctionWithAppReference(app) {
  try {
    const result = await app.rabbit.createMessage({queueName: 'another-custom-queue', path: 'example/id-of-this-example', method: 'update', body: {}});
    console.log('Got result:', result);
  } catch (error) {
    console.log('Got error:', error);
  }
}
```

## License

[MIT](LICENSE)

## Authors

- [Touch4IT, s.r.o. contributors](https://github.com/touch4it/feathers-rabbit-queue/graphs/contributors)
