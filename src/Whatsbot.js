const { output } = require('./Utils');

module.exports = class Whatsbot {
  constructor(client, clientName, clientId, config = 'whatsbot.config.js') {
    try {
      this.config = require(`${process.cwd()}/${config}`);
    } catch (error) {
      output({message: `\x1b[31mError: \x1b[0m${error.message}\nError in configuration file '${process.cwd()}/${config}'`}, 'error');
    }
    this.router = this.config.router;
    this.client = client;
    this.clientName = clientName;
    this.clientId = clientId;
    this.chats = [];
    this.contacts = [];
  }

  getConfig() {
    return this.config;
  }

  getRouter() {
    return this.router;
  }
}