'use strict';

var logger = require('logfmt');
var EventEmitter = require('events').EventEmitter;
let Connector = require('./lib/Connector');

class Service extends EventEmitter {
  constructor (mongoUrl, rabbitUrl, queueConfigs) {
    super();
    this.qConfigs = queueConfigs || [];
    this.queues = 0;
    this.connection = new Connector(mongoUrl, rabbitUrl);
    this.mongoose = this.connection.getMongooseReference();
    this.connection.once('ready', this._onConnected.bind(this));
    this.connection.once('lost', this._onLost.bind(this));
  }

  getMongooseReference () {
    return this.mongoose;
  }

  start () {
    this.qConfigs.forEach(queueConfig => {
      this.connection.queue.handle(queueConfig.name, queueConfig.handler);
    });
  }

  publish (queueName, payload) {
    this.connection.queue.publish(queueName, payload);
  }

  _onConnected () {
    this.qConfigs.forEach(qConfig => {
      this.connections.queue.create(qConfig.name, { prefetch: qConfig.prefetch }, this._onCreate);
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
