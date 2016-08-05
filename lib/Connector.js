'use strict';

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var jackrabbit = require('jackrabbit');
const logger = require('logfmt');
var EventEmitter = require('events').EventEmitter;

class Connector extends EventEmitter {
  constructor (mongoUrl, rabbitUrl) {
    super();
    this.readyCount = 0;

    this.db = mongoose.connect(mongoUrl, err => {
      if (err) {
        logger.log({ type: 'error', msg: err, service: 'mongodb' });
      } else {
        logger.log({ type: 'info', msg: 'connected', service: 'mongodb' });
        this._ready();
      }
    });

    this.queue = jackrabbit(rabbitUrl)
      .on('connected', () => {
        logger.log({ type: 'info', msg: 'connected', service: 'rabbitmq' });
        this._ready();
      })
      .on('error', err => {
        logger.log({ type: 'error', msg: err, service: 'rabbitmq' });
      })
      .on('disconnected', () => {
        logger.log({ type: 'error', msg: 'disconnected', service: 'rabbitmq' });
        this._lost();
      });

    this.exchange = this.queue.default();
  }

  getMongooseReference () {
    return mongoose;
  }

  _ready () {
    if (++this.readyCount === 2) {
      this.emit('ready');
    }
  }

  _lost () {
    this.emit('lost');
  }
}

module.exports = Connector;
