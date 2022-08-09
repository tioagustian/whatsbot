const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { Client, NoAuth, LocalAuth, LegacySessionAuth } = require('whatsapp-web.js');
const clients = require('../../clients.json');

const newClient = async (clientId = 0, options) => {
  console.log(clients);
  if (clients[clientId]) {
    clientId = Object.keys(clients).length;
  }

  const clientName = `whatsbot client #${clientId}`;
  let client = [];
  if(options.auth === false) {
    client = new Client({
      authStrategy: new NoAuth()
    });
  } else if(options.auth === 'legacy') {
    client = new Client({
      authStrategy: new LegacySessionAuth()
    });
  } else {
    client = new Client({
      authStrategy: new LocalAuth()
    });
  }
  client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
  });

  client.on('ready', () => {
    console.log(`\x1b[32mSuccessfully authorized!\x1b[0m`);
    console.log(`\x1b[32mClient: \x1b[33m${clientName}\x1b[0m`);
    console.log(`\x1b[32mClient ID: \x1b[33m${clientId}\x1b[0m`);
    return console.log(`\x1b[32mYou can now run whatsbot commands with: \x1b[0mwhatsbot start --client-id=${clientId}`);
  });

  clients[clientId] = clientName;
  console.log(JSON.stringify(clients));
  //rewrite clients.json
  fs.writeFileSync('./clients.json', JSON.stringify(clients));
  client.initialize();
}

const commands = [
  {
    name: 'new',
    description: 'Create a new client',
    arguments: [
      {
        name: '[clientId]',
        description: 'Client ID',
      }
    ],
    options: [
      {
        name: '--no-auth',
        description: 'No authentication method',
      },
      {
        name: '-a, --auth [method]',
        description: 'Authentication method',
        default: 'local',
        choices: ['local', 'legacysession']
      }
    ],
    action: newClient
  }
];

exports.newClient = newClient;
exports.commands = commands;