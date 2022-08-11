module.exports = class Whatsbot {
  constructor(options = {}) {
    try {
      this.config = require(`${process.cwd()}/whatsbot.config.js`);
    } catch (error) {
      console.log(`${process.cwd()}/whatsbot.config.js`);
      console.log(error, `No whatsbot.config.js file found!`);
    }
    this.options = options;
    this.router = this.config.router;
    this.commands = [];
    this.handlers = [];
    this.client = null;
    this.clientId = '';
    this.clientName = '';
    this.chats = {};
  }

  getConfig() {
    return this.config;
  }
}