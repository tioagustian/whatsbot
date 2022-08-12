const example = require('./commands/example');

module.exports = {
  welcomeMessage: {
    enabled: true,
    message: 'Welcome to WhatsBot!',
    showMenu: true,
  },
  router: [
    {
      keyword: 'help',
      description: 'Show menu',
      showMenu: true
    },
    {
      keyword: 'ping',
      description: 'Ping!',
      action: example.ping
    }
  ]
};