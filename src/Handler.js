const Router = require('./Router');

module.exports = class Handler {
  client = {};
  message = {};
  packet = {};
  chats = [];

  constructor(packet) {
    this.packet = packet;
    this.client = packet.client;
    this.chats = [];
  }

  handle(message) {
    try {
      this.message = message;
      const router = new Router(this);
      const chats = router.callAction();
      this.chats = chats;
    } catch (error) {
      console.error(error);
    }
  }

  reply(message, options = {}) {
    this.message.reply(message);
    return {message, options};
  }

  sendMessage(from, message, options = {}) {
    this.client.sendMessage(from, message);
    return {message, options};
  }

  getChats() {
    return this.chats;
  }
}