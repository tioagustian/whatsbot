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
    await this.chat.clearState();
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
    await this.chat.clearState();
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

  async downloadMedia() {
    return await this.message.downloadMedia();
  }

  async getQuotedMessage() {
    return await this.message.getQuotedMessage();
  }

  async backToMenu() {
    await this.sendMessage(this.message.from, `Please select menu:\n\n`+this.router.map((item, index) => `• *${item.keyword}*: ${item.description}`).join('\n'), this.router.map(item => item.keyword));
  }

  async createMenu(title = 'Please select menu:', options = [], footer = '\n', next = null) {
    await this.sendMessage(this.message.from, `${title}\n\n`+options.map((item, index) => `• *${item.keyword}*: ${item.description}`).join('\n')+footer, options.map(item => item.keyword), next);
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

  simulateTyping(message) {
    const cpm = this.config.cpm * 2;
    const CPms = 1000 / (cpm/60);
    const ms = message.length * CPms;
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  sleep(ms = 1000) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}