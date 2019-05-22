'use strict';

import { Mongoose } from "mongoose";

var logger = require('logfmt');
var EventEmitter = require('events').EventEmitter;
let Connector = require('./lib/Connector');

export interface MMConfig {
  name: string,
  durable?: boolean,
  handler?: Function
}

export class Service extends EventEmitter {
  constructor (mongoUrl:string, rabbitUrl:string) {
    super();
    this.qConfigs = [];
    this.queues = 0;
    this.namedQueues = new Map(); // Exchange name > exchange
    this.connection = new Connector(mongoUrl, rabbitUrl);
    this.mongoose = this.connection.getMongooseReference();
    this.connection.once('ready', this._onReady.bind(this));
    this.connection.once('lost', this._onLost.bind(this));
  }

  addQueues (queueConfigs:Array<MMConfig>) {
    if (!Array.isArray(queueConfigs)) {
      throw new Error('queueConfigs must be an array of queue config objects');
    }
    this.qConfigs = queueConfigs;

    this.qConfigs.forEach((qConfig:MMConfig) => {
      // TODO: make this more programmatic, so we just shave off handler and feed in the whole config
      let newQueue = this.connection.exchange.queue({name: qConfig.name, durable: qConfig.durable});
      this.namedQueues.set(qConfig.name, newQueue);
    });
  }

  getMongooseReference () : Mongoose {
    return this.mongoose;
  }

  /*
  * @throws {Error} handler must be defined for all queues
  *
  */
  start () {
    this.qConfigs.forEach((queueConfig:MMConfig) => {
      let queue = this.namedQueues.get(queueConfig.name);
      queue.consume(queueConfig.handler);
    });
  }

  publish (queueName: string, payload:object) {
    this.connection.exchange.publish(payload, { key: queueName });
  }

  _onReady () {
    logger.log({ type: 'info', msg: 'app.ready' });
    this.emit('ready');
  }

  _onLost () {
    logger.log({ type: 'info', msg: 'app.lost' });
    this.emit('lost');
  }

  stop () {
    this.qConfigs.forEach((queueConfig:MMConfig) => {
      this.connection.queue.ignore(queueConfig.name);
    });
  }

}

