const Router = require('./Router');
const fs = require('fs');

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
    this.chat = {};
  }

  async handle(message) {
    try {
      this.message = message;
      const router = new Router(this);
      this.chat = await message.getChat();
      await this.sleep();
      await this.chat.sendSeen();
      await router.callAction();
    } catch (error) {
      console.error(error);
    }
  }

  async reply(message, options = {}, next = null) {
    this.chat.sendStateTyping();
    await this.simulateTyping(message);
    return new Promise((resolve, reject) => {
      const from = this.message.from;
      this.message.reply(message);
      const chats = this.chats;
      chats.map((item, index) => {
        if (item.from === from) {
          chats[index].lastMessageSent = message;
          chats[index].lastMessageSentTime = new Date();
          chats[index].next = next;
          chats[index].options = options;
        }
      });
      this.saveChats(chats);
      resolve({from, message, options, next});
    });
  }

  async sendMessage(from, message, options = {}, next = null) {
    this.chat.sendStateTyping();
    await this.simulateTyping(message);
    return new Promise((resolve) => {
      this.client.sendMessage(from, message);
      const chats = this.chats;
      chats.map((item, index) => {
        if (item.from === from) {
          chats[index].lastMessageSent = message;
          chats[index].lastMessageSentTime = new Date();
          chats[index].next = next;
          chats[index].options = options;
        }
      });
      this.saveChats(chats);
      resolve({from, message, options, next});
    });

  }

  getChats() {
    return this.chats;
  }

  saveChats(chats) {
    this.chats = chats;
    // fs.writeFileSync(`${__dirname}/../logs/${this.clientId}-chats.json`, JSON.stringify(chats, null, 2));
  }

  getContacts() {
    return this.contacts;
  }

  saveContacts(contact) {
    this.contacts.push(contact);
    fs.writeFileSync(`${__dirname}/../logs/${this.clientId}-contacts.json`, JSON.stringify(this.contacts, null, 2));
  }

  simulateTyping(message) {
    const CPms = 1000 / (this.config.cpm/60);
    const ms = message.length * CPms;
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  sleep(ms = 100) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}