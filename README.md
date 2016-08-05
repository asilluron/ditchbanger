# mongo-microservice
Opinionated Node microservice/worker base intended to utilized MongoDB + RabbitMQ

## Usage
```
let Service = require('mongo-microservice');
const QUEUE_NAME = 'example';
class ExampleService extends Service {

  constructor (config) {
    super(process.env.mongoUri, process.env.rabbitUri);
    this.addQueues([{name: QUEUE_NAME, handler: this._handleExample}]);
    this.mongoose = this.getMongooseReference();
  }

  _handleExample (payload, ack) {
    console.log(payload);
    ack();
  }

  start () {
    super.start();

    this.publish(QUEUE_NAME, 'Hello World');
}

module.exports = ExampleService;

```

## API
* addQueues

## Events


