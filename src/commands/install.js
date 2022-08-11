const fs = require('fs');

const install = function () {
  if (!fs.existsSync(`${process.cwd()}/commands`)) {
    fs.mkdirSync(`${process.cwd()}/commands`);
  }
  
  if (!fs.existsSync(`${process.cwd()}/whatsbot.config.js`)) {
    fs.writeFileSync(`${process.cwd()}/whatsbot.config.js`, `
const { Router } = require('@tioagustian/whatsbot');

module.exports = {
  // Router
  router: [
    {
      keyword: 'help',
      description: 'Show menu',
      default: true,
      action: Router.showMenu
    }
  ]
};`);
  }
}

const commands = [
  {
    name: 'install',
    description: 'Install modules',
    action: install
  }
];

exports.commands = commands;