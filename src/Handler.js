const Router = require('./Router');

module.exports = class Handler {
  constructor(whatsbot) {
    this.whatsbot = whatsbot;
    this.client = whatsbot.client;
    this.clientName = whatsbot.clientName;
    this.clientId = whatsbot.clientId;
    this.chats = whatsbot.chats;
    this.contacts = whatsbot.contacts;
    this.router = whatsbot.router;
    this.config = whatsbot.config;
  }

  async handle(message) {
    try {
      this.message = message;
      const router = new Router(this);
      await router.callAction();
      console.log('Handler', this.chats);
    } catch (error) {
      console.error(error);
    }
  }

  reply(message, options = {}, nextAction = null) {
    return new Promise((resolve, reject) => {
      const from = this.message.from;
      this.message.reply(message).then(() => {
        this.chats.map((item, index) => {
          if (item.from === message.from) {
            this.chats[index].lastMessageSent = message;
            this.chats[index].lastMessageSentTime = new Date();
            this.chats[index].nextAction = nextAction;
            this.chats[index].options = options;
          }
        });
        resolve({from, message, options, nextAction});
      });
    });
  }

  sendMessage(from, message, options = {}, nextAction = null) {
    return new Promise((resolve) => {
      this.client.sendMessage(from, message);
        this.chats.map((item, index) => {
          if (item.from === message.from) {
            this.chats[index].lastMessageSent = message;
            this.chats[index].lastMessageSentTime = new Date();
            this.chats[index].nextAction = nextAction;
            this.chats[index].options = options;
          }
        });
        resolve({from, message, options, nextAction});
    });

  }

  getChats() {
    return this.chats;
  }

  saveChats(chats) {
    this.chats = chats;
  }

  getContacts() {
    return this.contacts;
  }

  saveContacts(contact) {
    this.contacts.push(contact);
  }
}