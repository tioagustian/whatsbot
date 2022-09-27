import EventEmitter from 'events';

module.exports = class Event {
  constructor(clientId) {
    this.clientId = clientId;
    this.eventEmitter = new EventEmitter();
  }

  on(event, callback) {
    this.eventEmitter.on(event, callback);
  }

  emit(event, data) {
    this.eventEmitter.emit(event, data);
  }
}