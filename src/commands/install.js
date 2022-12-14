const fs = require('fs');

const install = function () {
  if (!fs.existsSync(`${process.cwd()}/commands`)) {
    fs.mkdirSync(`${process.cwd()}/commands`);
    fs.copyFileSync(`${__dirname}/../../example/commands/example.js`, `${process.cwd()}/commands/example.js`);
  }
  
  if (!fs.existsSync(`${process.cwd()}/whatsbot.config.js`)) {
    fs.copyFileSync(`${__dirname}/../../example/whatsbot.config.js`, `${process.cwd()}/whatsbot.config.js`);
  }

  if (!fs.existsSync(`${process.cwd()}/.whatsbot`)) {
    fs.mkdirSync(`${process.cwd()}/.whatsbot`);
    fs.mkdirSync(`${process.cwd()}/.whatsbot/logs`);
  }
  console.log('WhatsBot installed successfully!');
}

const commands = [
  {
    name: 'install',
    description: 'Install modules',
    action: install
  }
];

exports.commands = commands;