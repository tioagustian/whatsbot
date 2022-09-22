const Router = require('./Router');
const moment = require('moment');

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
    moment.locale(this.config.locale || 'en');
    this.function = {
      backToMenu: this.backToMenu.bind(this),
      createMenu: this.createMenu.bind(this),
      downloadMedia: this.downloadMedia.bind(this),
      getChats: this.getChats.bind(this),
      getContacts: this.getContacts.bind(this),
      getContact: this.getContact.bind(this),
      getRouter: this.getRouter.bind(this),
      reply: this.reply.bind(this),
      sendMessage: this.sendMessage.bind(this),
      sendSeen: this.sendSeen.bind(this),
      sendStateTyping: this.sendStateTyping.bind(this),
      saveChats: this.saveChats.bind(this),
      saveContacts: this.saveContacts.bind(this),
      updateContact: this.updateContact.bind(this),
      plugins: {
        moment: moment,
      }
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
    await this.chat.clearState();
    await this.sleep();
    await this.chat.sendSeen();
    this.chat.sendStateTyping();
    await this.simulateTyping(message);
    await this.chat.clearState();
    options.quotedMessageId = this.message.id._serialized;
    return new Promise(async (resolve, reject) => {
      const from = this.message.from;
      await this.client.sendMessage(from, message, options);
      const chats = this.chats;
      chats.map((item, index) => {
        if (item.from === from) {
          chats[index].status = 'sent';
          chats[index].lastMessageSent = message;
          chats[index].lastMessageSentTime = new Date();
          chats[index].next = next;
          chats[index].options = options;
          chats[index].timeout = new Date().getTime() + this.config.timeout;
        }
      });
      this.saveChats(chats);
      resolve({from, message, options, next});
    });
  }

  async sendMessage(message, options = {}, next = null) {
    let from = this.message.from;
    await this.chat.clearState();
    await this.sleep();
    await this.chat.sendSeen();
    this.chat.sendStateTyping();
    await this.simulateTyping(message);
    await this.chat.clearState();
    return new Promise(async (resolve) => {
      await this.client.sendMessage(from, message, options);
      const chats = this.chats;
      let i = 0;
      chats.map((item, index) => {
        if (item.from === from) {
          chats[index].status = 'sent';
          chats[index].lastMessageSent = message;
          chats[index].lastMessageSentTime = new Date();
          chats[index].next = next;
          chats[index].options = options;
          chats[index].timeout = new Date().getTime() + this.config.timeout;
          i = index;
        }
      });
      this.saveChats(chats);
      resolve({from, message, options, next});
    });
  }

  async sendMessageTo(to, message, options = {}, next = null) {
    await this.chat.clearState();
    await this.sleep();
    await this.chat.sendSeen();
    this.chat.sendStateTyping();
    await this.simulateTyping(message);
    await this.chat.clearState();
    return new Promise(async (resolve) => {
      await this.client.sendMessage(to, message, options);
      const chats = this.chats;
      chats.map((item, index) => {
        if (item.from === to) {
          chats[index].status = 'sent';
          chats[index].lastMessageSent = message;
          chats[index].lastMessageSentTime = new Date();
          chats[index].next = next;
          chats[index].options = options;
          chats[index].timeout = new Date().getTime() + this.config.timeout;
        }
      });
      this.saveChats(chats);
      resolve({to, message, options, next});
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
    await this.sendMessage(`Please select menu:\n\n`+this.router.map((item, index) => `• *${item.keyword}*: ${item.description}`).join('\n'), this.router.map(item => item.keyword));
  }

  async createMenu(title = 'Please select menu:', footer = '\n', options = this.router, format = `• *{keyword}*: {description}`, next = null) {
    await this.sendMessage(`${title}\n\n`+options.map((item, index) => format.replace('{keyword}', item.keyword).replace('{description}', item.description)).join('\n')+footer, options.map(item => item.keyword), next);
  }

  getChats() {
    return this.chats;
  }

  saveChats(chats) {
    this.chats = chats;
  }

  deleteChat(from) {
    const chats = this.chats;
    this.chats.map((item, index) => {
      if (item.from === from) {
        chats.splice(index, 1);
      }
    });
    this.saveChats(chats);
  }

  getContacts() {
    return this.contacts;
  }

  getContact(number = this.message.from) {
    return this.contacts.find(item => item.number === number);
  }

  updateContact(id, data) {
    this.contacts.update(id, data);
  }

  async saveContacts(contact) {
    const default_ = await this.message.getContact();
    this.contacts.push({number: contact, default_ : default_});
  }

  getRouter() {
    return this.router;
  }

  simulateTyping(message) {
    const length = (message.length > 250) ? 250 : message.length;
    const cpm = this.config.cpm * 2;
    const CPms = 1000 / (cpm/60);
    const ms = length * CPms;
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  sleep(ms = this.config.delay || 500) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}