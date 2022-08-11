const Whatsbot = require('./index');
const Chat = require('./Chat');
module.exports = class Router {
  constructor(handler) {
    this.handler = handler;
    this.config = new Whatsbot().getConfig();
    this.router = this.config.router;
  }

  async callAction() {
    const message = this.handler.message;
    const keyword = message.body.split(' ')[0];
    const route = this.router.find(item => item.keyword === keyword);
    let chats = await Promise.resolve(this.handler.getChats());
    const wwChat = new Chat(this.handler.client, message);
    await wwChat.sendStateTyping();
    console.log(chats);
    const chat = chats.find(item => item.from === message.from);
    let sent = false;
    if (!chat) {
      if (this.config.welcomeMessage.enabled) {
        await this.sleep(5000);
        sent = this.handler.sendMessage(message.from, this.config.welcomeMessage.message);
        if (this.config.welcomeMessage.showMenu) {
          sent = this.handler.sendMessage(message.from, this.config.router.map((item, index) => `${ index }. ${item.keyword}: ${item.description}`).join('\n'), this.config.router.map(item => item.keyword));
        }
      }
      chats.push({
        id: Object.keys(chats).length,
        from: message.from,
        lastKeyword: 'menu',
        lastMessage: message.body,
        lastMessageTime: new Date(),
        lastMessageSent: sent.message,
        lastMessageSentTime: new Date(),
        nextAction: '',
        options: sent.options
      });
      return chats;
    }

    await this.sleep(5000);
    if (route) {
      sent = route.action(this.handler);
    } else {
      sent = this.handler.message.reply("Sorry, I don't understand you!");
    }

    chats.map((item, index) => {
      if (item.from === message.from) {
        chats[index].from = message.from;
        chats[index].lastKeyword = keyword;
        chats[index].lastMessage = message.body;
        chats[index].lastMessageTime = new Date();
        chats[index].lastMessageSent = sent.message;
        chats[index].lastMessageSentTime = new Date();
        chats[index].nextAction = '';
        chats[index].options = sent.options;
      }
    });
    return chats;
  }

  showMenu(handler) {
    handler.sendMessage(message.from, `OK!`);
  }

  sleep(ms = 3000) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}