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
    this.config = whatsbot.config;
    this.media = {};
    this.router = whatsbot.router;
    this.function = {
      backToMenu: this.backToMenu.bind(this),
      createMenu: this.createMenu.bind(this),
      downloadMedia: this.downloadMedia.bind(this),
      getChats: this.getChats.bind(this),
      getContacts: this.getContacts.bind(this),
      reply: this.reply.bind(this),
      sendMessage: this.sendMessage.bind(this),
      sendSeen: this.sendSeen.bind(this),
      sendStateTyping: this.sendStateTyping.bind(this),
    }
  }

  async handle(message) {
    try {
      this.message = message;
      this.chat = await message.getChat();
      const router = new Router(this);
      await this.sleep();
      await router.callAction();
    } catch (error) {
      console.error(error);
    }
  }

  async handleMedia(message, media) {
    try {
      this.message = message;
      this.chat = await message.getChat();
      const router = new Router(this, media);
      await this.sleep();
      await router.callAction();
    } catch (error) {
      console.error(error);
    }
  }

  async reply(message, options = {}, next = null) {
    await this.sleep();
    await this.chat.sendSeen();
    this.chat.sendStateTyping();
    await this.simulateTyping(message);
    await this.chat.clearState();
    options.quotedMessageId = this.message.id._serialized;
    return new Promise(async (resolve, reject) => {
      const from = this.message.from;
      await this.client.sendMessage(this.message.from, message, options);
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
    await this.sleep();
    await this.chat.sendSeen();
    this.chat.sendStateTyping();
    await this.simulateTyping(message);
    await this.chat.clearState();
    return new Promise(async (resolve) => {
      await this.client.sendMessage(from, message, options);
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

  async sendSeen() {
    return await this.chat.sendSeen();
  }
  
  sendStateTyping() {
    return this.chat.sendStateTyping();
  }

  async downloadMedia() {
    return new Promise(async (resolve, reject) => {
      resolve(this.media);
    }).catch(error => {
      console.error(error);
    });
  }

  async getQuotedMessage() {
    return await this.message.getQuotedMessage();
  }

  async backToMenu() {
    this.chat.sendStateTyping();
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
    // fs.writeFileSync(`${__dirname}/../logs/${this.clientId}-contacts.json`, JSON.stringify(this.contacts, null, 2));
  }

  simulateTyping(message) {
    const cpm = this.config.cpm * 2;
    const CPms = 1000 / (cpm/60);
    const ms = message.length * CPms;
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  sleep(ms = 500) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}