const { Buttons } = require('whatsapp-web.js');
module.exports = class Router {
  constructor(handler) {
    this.handler = handler;
    this.config = handler.config;
    this.router = handler.router;
  }

  async callAction() {
    const message = this.handler.message;
    const keyword = message.body.split(' ')[0];
    const route = this.router.find(item => item.keyword === keyword);
    let chats = await Promise.resolve(this.handler.getChats());
    const contact = this.handler.contacts.find(item => item === message.from);

    if (!contact) {
      chats.push({
        id: Object.keys(chats).length,
        from: message.from,
        keyword: 'menu',
        body: message.body,
        hasMedia: message.hasMedia,
        hasQuotedMsg: message.hasQuotedMsg,
        recievedAt: new Date()
      });

      this.handler.saveContacts(message.from);
      this.handler.saveChats(chats);
      
      if (this.config.welcomeMessage.enabled) {
        
        await this.handler.sendMessage(message.from, this.config.welcomeMessage.message);
        if (this.config.welcomeMessage.showMenu) {
          await this.handler.sendMessage(message.from, `Please select menu:\n\n`+this.config.router.map((item, index) => `• *${item.keyword}*: ${item.description}`).join('\n'), this.config.router.map(item => item.keyword));
          // await this.handler.sendMessage(message.from, new Buttons(`Please select menu`, this.config.router.map(item => (
          //   {id: item.keyword, body: item.description}
          // )) ), this.config.router.map(item => item.keyword));
        }
      }
      return "Sent!";
    } else {
      const chat = chats.find(item => item.from === message.from);
      chats.map((item, index) => {
        if (item.from === message.from) {
          chats[index].from = message.from;
          chats[index].keyword = keyword;
          chats[index].body = message.body;
          chats[index].hasMedia = message.hasMedia;
          chats[index].hasQuotedMsg = message.hasQuotedMsg;
          chats[index].recievedAt = new Date();
        }
      });
      this.handler.saveChats(chats);
      if (route) {
        if (route.showMenu){
          await this.handler.sendMessage(message.from, `Please select menu:\n\n`+this.config.router.map((item, index) => `• *${item.keyword}*, ${item.description}`).join('\n'), this.config.router.map(item => item.keyword));
          // await this.handler.sendMessage(message.from, new Buttons(`Please select menu`, this.config.router.map(item => (
          //   {id: item.keyword, body: item.description}
          // )) ), this.config.router.map(item => item.keyword));
        } else if (route.action && typeof route.action === 'function') {
          await route.action(this.handler, chat);
        }
        
        return "Sent!";
      } else if (typeof chat != 'undefined' && chat.next) {
        if (typeof chat.next === 'function') {
          await chat.next(this.handler, chat);
          return "Sent!";
        }
      } else {
        await this.handler.reply("Sorry, I don't understand you!");
        await this.handler.sendMessage(message.from, `Please select menu:\n\n`+this.config.router.map((item, index) => `• *${item.keyword}*: ${item.description}`).join('\n'), this.config.router.map(item => item.keyword));
        return "Sent!";
      }
    }
  }
}