const { output } = require('./Utils');
const fs = require('fs');

module.exports = class Whatsbot {
  constructor(client, clientName, clientId, config = 'whatsbot.config.js') {
    try {
      this.config = require(`${process.cwd()}/${config}`);
    } catch (error) {
      output({message: `\x1b[31mError: \x1b[0m${error.message}\nError in configuration file '${process.cwd()}/${config}'`}, 'error');
    }

    // if (!fs.existsSync(`${__dirname}/../logs/${clientId}-contacts.json`)) {
    //   fs.writeFileSync(`${__dirname}/../logs/${clientId}-contacts.json`, '[]');
    // }

    // this.chats = require(`${__dirname}/../logs/${clientId}-chats.js`);
    this.chats = [];
    // this.contacts = require(`${__dirname}/../logs/${clientId}-contacts.json`);
    this.contacts = [];
    this.router = this.config.router;
    this.client = client;
    this.clientName = clientName;
    this.clientId = clientId;
  }

  getConfig() {
    return this.config;
  }

  getRouter() {
    return this.router;
  }
}