const test = require('./commands/test');

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
      keyword: 'test',
      description: 'Test',
      action: test.justTest
    }
  ]
};