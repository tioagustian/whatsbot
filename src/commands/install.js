const fs = require('fs');

const install = function () {
  
}

const commands = [
  {
    name: 'install',
    description: 'Install modules',
    action: install
  }
];

exports.commands = commands;