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
    const route = this.router.find(item => item.keyword === keyword);
    let chats = await Promise.resolve(this.handler.getChats());
    const contact = this.handler.contacts.find(item => item === message.from);
    const media = this.media;

    if (!contact) {
      const chat = {
        ...this.handler.function,
        id: message.id,
        from: message.from,
        keyword: 'menu',
        body: message.body,
        hasMedia: message.hasMedia,
        hasQuotedMsg: message.hasQuotedMsg,
        media: media,
        recievedAt: new Date()
      }
      chats.push(chat);
      this.handler.saveContacts(message.from);
      this.handler.saveChats(chats);
      
      if (this.handler.config.welcomeMessage.enabled) {
        
        await this.handler.sendMessage(message.from, this.handler.config.welcomeMessage.message);
        if (this.handler.config.welcomeMessage.showMenu) {
          await this.handler.sendMessage(message.from, `Please select menu:\n\n`+this.handler.config.router.map((item, index) => `• *${item.keyword}*: ${item.description}`).join('\n'), this.handler.config.router.map(item => item.keyword));
        }
      }
      return "Sent!";
    } else {
      const chat = chats.find(item => item.from === message.from);
      chats.map((item, index) => {
        if (item.from === message.from) {
          chats[index] = Object.assign(chats[index], this.handler.function);
          chats[index].id = message.id;
          chats[index].from = message.from;
          chats[index].keyword = keyword;
          chats[index].body = message.body;
          chats[index].hasMedia = message.hasMedia;
          chats[index].media = media;
          chats[index].hasQuotedMsg = message.hasQuotedMsg;
          chats[index].recievedAt = new Date();
        }
      });
      this.handler.saveChats(chats);
      
      if (route) {
        if (route.showMenu){
          await this.handler.sendMessage(message.from, `Please select menu:\n\n`+this.handler.config.router.map((item, index) => `• *${item.keyword}*, ${item.description}`).join('\n'), this.handler.config.router.map(item => item.keyword));
        } else if (route.action && typeof route.action === 'function') {
          await route.action(this.handler, chats.find(item => item.from === message.from));
        }
        
        return "Sent!";
      } else if (typeof chat != 'undefined' && chat.next) {
        if (typeof chat.next === 'function') {
          await chat.next(this.handler, chats.find(item => item.from === message.from));
          return "Sent!";
        }
      } else {
        await this.handler.reply("Sorry, I don't understand you!");
        await this.handler.sendMessage(message.from, `Please select menu:\n\n`+this.handler.config.router.map((item, index) => `• *${item.keyword}*: ${item.description}`).join('\n'), this.handler.config.router.map(item => item.keyword));
        return "Sent!";
      }
    }
  }
}