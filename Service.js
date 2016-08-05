'use strict';

var logger = require('logfmt');
var EventEmitter = require('events').EventEmitter;
let Connector = require('./lib/Connector');

class Service extends EventEmitter {
  constructor (mongoUrl, rabbitUrl) {
    super();
    this.qConfigs = [];
    this.queues = 0;
    this.namedQueues = new Map(); // Exchange name > exchange
    this.connection = new Connector(mongoUrl, rabbitUrl);
    this.mongoose = this.connection.getMongooseReference();
    this.connection.once('ready', this._onConnected.bind(this));
    this.connection.once('lost', this._onLost.bind(this));
  }

  addQueues (queueConfigs) {
    if (!Array.isArray(queueConfigs)) {
      throw new Error('queueConfigs must be an array of queue config objects');
    }
    this.qConfigs = queueConfigs;
  }

  getMongooseReference () {
    return this.mongoose;
  }

  start () {
    this.qConfigs.forEach(queueConfig => {
      let queue = this.namedQueues.get(queueConfig.name);
      queue.consume(queueConfig.handler);
    });
  }

  publish (queueName, payload) {
    this.connection.exchange.publish(payload, { key: queueName });
  }

  _onConnected () {
    this.qConfigs.forEach(qConfig => {
      // TODO: make this more programmatic, so we just shave off handler and feed in the whole config
      let newQueue = this.connection.exchange.queue({name: qConfig.name, durable: true});
      this.namedQueues.set(qConfig.name, newQueue);
      this._onCreate();
    });
  }

  _onReady () {
    logger.log({ type: 'info', msg: 'app.ready' });
    this.emit('ready');
  }

  _onCreate () {
    if (++this.queues === this.qConfigs.length) {
      this._onReady();
    }
  }

  _onLost () {
    logger.log({ type: 'info', msg: 'app.lost' });
    this.emit('lost');
  }

  stop () {
    this.qConfigs.forEach(queueConfig => {
      this.connection.queue.ignore(queueConfig.name);
    });
  }

}

module.exports = Service;
