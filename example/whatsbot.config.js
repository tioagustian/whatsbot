const example = require('./commands/example');

module.exports = {
  cpm: 600,
  welcomeMessage: {
    enabled: true,
    message: 'Welcome to WhatsBot!',
    showMenu: true,
  },
  errorMessage: "Sorry, I don't understand that command!",
  router: [
    {
      keyword: 'help',
      description: 'Show menu',
      showMenu: true
    },
    {
      keyword: 'ping',
      description: 'Ping!',
      accept: 'text',
      action: example.ping
    }
  ]
};