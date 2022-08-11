module.exports = class Whatsbot {
  constructor(client, clientName, clientId, config = '') {
    try {
      this.config = config !== '' ? require(`${process.cwd()}/${config}`) : require(`${process.cwd()}/whatsbot.config.js`);
    } catch (error) {
      console.error(error, `No whatsbot.config.js file found!`);
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