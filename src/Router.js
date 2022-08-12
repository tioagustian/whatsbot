const Chat = require('./Chat');
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
    const wwChat = new Chat(this.handler.client, message);
    await wwChat.sendStateTyping();
    console.log('Router', chats);
    const contact = this.handler.contacts.find(item => item === message.from);
    const chat = chats.find(item => item.from === message.from);
    let sent = false;
    if (!contact) {
      chats.push({
        id: Object.keys(chats).length,
        from: message.from,
        lastKeyword: 'menu',
        lastMessage: message.body,
        lastMessageTime: new Date(),
        lastMessageSent: '',
        lastMessageSentTime: '',
        nextAction: null,
        options: []
      });

      this.handler.saveContacts(message.from);
      this.handler.saveChats(chats);

      if (this.config.welcomeMessage.enabled) {
        await this.sleep();
        await this.handler.sendMessage(message.from, this.config.welcomeMessage.message);
        if (this.config.welcomeMessage.showMenu) {
          await this.handler.sendMessage(message.from, this.config.router.map((item, index) => `• ${item.keyword}, ${item.description}`).join('\n'), this.config.router.map(item => item.keyword));
          // await this.handler.sendMessage(message.from, new Buttons(`Please select menu`, this.config.router.map(item => (
          //   {id: item.id, body: item.description}
          // )) ), this.config.router.map(item => item.keyword));
        }
      }
      return "Sent!";
    } else {
      chats.map((item, index) => {
        if (item.from === message.from) {
          chats[index].from = message.from;
          chats[index].lastKeyword = keyword;
          chats[index].lastMessage = message.body;
          chats[index].lastMessageTime = new Date();
          chats[index].lastMessageSent = '';
          chats[index].lastMessageSentTime = '';
          chats[index].nextAction = null;
          chats[index].options = [];
        }
      });
      this.handler.saveChats(chats);

      await this.sleep();
      if (route) {
        if (route.action && typeof route.action === 'function') {
          await route.action(this.handler);
        }
      } else {
        await this.handler.reply("Sorry, I don't understand you!");
      }
      return "Sent!";
    }
  }

  showMenu(handler) {
    handler.sendMessage(message.from, `OK!`);
  }

  sleep(ms = 5000) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}