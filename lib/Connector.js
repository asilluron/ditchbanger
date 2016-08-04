'use strict';

var mongoose = require('mongoose');
var jackrabbit = require('jackrabbit');
const logger = require('logfmt');
var EventEmitter = require('events').EventEmitter;

class Connector extends EventEmitter {
  constructor (mongoUrl, rabbitUrl) {
    super();
    this.readyCount = 0;

    this.db = mongoose.createConnection(mongoUrl)
      .on('connected', () => {
        logger.log({ type: 'info', msg: 'connected', service: 'mongodb' });
        this._ready();
      })
      .on('error', err => {
        logger.log({ type: 'error', msg: err, service: 'mongodb' });
      })
      .on('close', str => {
        logger.log({ type: 'error', msg: 'closed', service: 'mongodb' });
      })
      .on('disconnected', () => {
        logger.log({ type: 'error', msg: 'disconnected', service: 'mongodb' });
        this._lost();
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
