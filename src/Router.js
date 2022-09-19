const { Buttons } = require('whatsapp-web.js');
module.exports = class Router {
  constructor(handler, media = {}) {
    this.handler = handler;
    this.router = handler.router;
    this.media = media;
  }

  async callAction() {
    const message = this.handler.message;
    const keyword = message.body.split(' ')[0];
    const route = this.router.find(item => keyword.match(new RegExp(item.keyword, 'i')));
    let chats = await Promise.resolve(this.handler.getChats());
    const contact = this.handler.contacts.find(item => item.number === message.from);
    const media = this.media;
    if (!contact) {
      await this.handler.saveContacts(message.from);
      return this.sendWelcomeMessage(message, media, chats);
    } else {
      const chat = chats.find(item => item.from === message.from);
      if (!chat) {
        return this.sendWelcomeMessage(message, media, chats);
      } else if(chat.timeout && chat.timeout < new Date().getTime()) {
        return this.sendWelcomeMessage(message, media, chats);
      } else {
        
        chats.map((item, index) => {
          if (item.from === message.from) {
            chats[index] = Object.assign(chats[index], this.handler.function, message);
            chats[index].keyword = keyword;
            // chats[index].id = message.id;
            // chats[index].from = message.from;
            // chats[index].body = message.body;
            // chats[index].hasMedia = message.hasMedia;
            // chats[index].hasQuotedMsg = message.hasQuotedMsg;
            chats[index].media = media;
            chats[index].recievedAt = new Date();
          }
        });
        this.handler.saveChats(chats);
        
        if (route) {
          if (route.showMenu){
            await this.handler.sendMessage(`Please select menu:\n\n`+this.handler.config.router.map((item, index) => `• *${item.keyword}*, ${item.description}`).join('\n'), this.handler.config.router.map(item => item.keyword));
          } else if (route.action && typeof route.action === 'function') {
            await route.action(chats.find(item => item.from === message.from));
          }
          
          return "Sent!";
        } else if (typeof chat != 'undefined' && chat.next) {
          if (typeof chat.next === 'function') {
            await chat.next(chats.find(item => item.from === message.from));
            return "Sent!";
          }
        } else {
          const error = this.handler.config.errorMessage || "Sorry, I don't understand that command!";
          await this.handler.reply(error);
          await this.sendWelcomeMessage(message, media, chats);
          return "Sent!";
        }
      }
    }
  }

  async sendWelcomeMessage(message, media, chats) {
    const chat = {
      ...this.handler.function,
      ...message,
      keyword: 'menu',
      // id: message.id,
      // from: message.from,
      // body: message.body,
      // hasMedia: message.hasMedia,
      // hasQuotedMsg: message.hasQuotedMsg,
      media: media,
      recievedAt: new Date(),
    }
    
    chats.push(chat);
    this.handler.saveChats(chats);
    if (this.handler.config.welcomeMessage.enabled) {
      if (typeof this.handler.config.welcomeMessage.action === 'function') {
        await this.handler.config.welcomeMessage.action(chats.find(item => item.from === message.from));
      } else {
        await this.handler.sendMessage(this.handler.config.welcomeMessage.message);
        if (this.handler.config.welcomeMessage.showMenu) {
          await this.handler.sendMessage(`Please select menu:\n\n`+this.handler.config.router.map((item, index) => `• *${item.keyword}*: ${item.description}`).join('\n'));
        }
      }
    }
  }
}