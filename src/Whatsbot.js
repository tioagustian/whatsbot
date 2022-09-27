const { output } = require('./Utils');

module.exports = class Whatsbot {
  constructor(client, clientName, clientId, config = 'whatsbot.config.js') {
    try {
      this.config = require(`${process.cwd()}/${config}`);
    } catch (error) {
      output({message: `\x1b[31mError: \x1b[0m${error.message}\nError in configuration file '${process.cwd()}/${config}'`}, 'error');
    }
    
    if (this.config.saveContact) {
      const contacts = require('./Contacts');
      this.contacts = new contacts(clientId, this.config);
    } else {
      this.contacts = [];
    }
    this.chats = [];
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

  checkConfigurations() {
    if (!this.router) {
      output({message: `\x1b[31mError: \x1b[0mNo router defined in configuration file!`}, 'error');
    }
    
    for (let i = 0; i < this.router.length; i++) {
      if (!this.router[i].accept) {
        output({message: `\x1b[33mWarning: \x1b[0mRoute '${route}' has no accepted type. Using default type 'text`});
        this.router[i].accept = 'text';
      }
    }
  }
}