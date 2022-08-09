const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { Client, NoAuth, LocalAuth, LegacySessionAuth } = require('whatsapp-web.js');
const clients = require('../../clients.json');

const newClient = async (clientId = 0, options) => {
  if (clients[clientId]) {
    clientId = Object.keys(clients).length;
  }

  const clientName = `whatsbot_client_${clientId}`;
  let client = [];
  if(options.auth === false) {
    client = new Client({
      authStrategy: new NoAuth(),
      puppeteer: { handleSIGINT: false}
    });
  } else if(options.auth === 'legacy') {
    client = new Client({
      authStrategy: new LegacySessionAuth(),
      puppeteer: { handleSIGINT: false}
    });
  } else {
    client = new Client({
      authStrategy: new LocalAuth({clientId: clientName}),
      puppeteer: { handleSIGINT: false}
    });
  }
  client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
  });

  client.on('ready', () => {
    console.log(`\x1b[32mSuccessfully authorized!\x1b[0m`);
    console.log(`\x1b[32mClient: \x1b[33m${clientName}\x1b[0m`);
    console.log(`\x1b[32mClient ID: \x1b[33m${clientId}\x1b[0m`);
    console.log(`Wait for 3-4 minutes and you can run whatsbot commands with: \x1b[32mwhatsbot start ${clientId}\x1b[0m`);
    console.log(`\x1b[32m${clientName} running...\x1b[0m`);
  });

  client.on('message', message => {
    console.log(`\x1b[33m${clientName}:\x1b[0m ${message.from} say ${message.body}`);
  });

  clients[clientId] = {name: clientName, options: options};
  fs.writeFileSync('./clients.json', JSON.stringify(clients));
  client.initialize();
}

const startClient = async (clientId = 0) => {
  if (!clients[clientId]) {
    console.log(`\x1b[31mClient #${clientId} does not exist!\x1b[0m`);
    process.exit(1);
  }

  const clientName = clients[clientId].name;
  const options = clients[clientId].options;
  let client = [];
  if(options.auth === false) {
    client = new Client({
      authStrategy: new NoAuth(),
      puppeteer: { handleSIGINT: false}
    });
  } else if(options.auth === 'legacy') {
    client = new Client({
      authStrategy: new LegacySessionAuth(),
      puppeteer: { handleSIGINT: false}
    });
  } else {
    client = new Client({
      authStrategy: new LocalAuth({clientId: clientName}),
      puppeteer: { handleSIGINT: false}
    });
  }
  client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
  });

  client.on('ready', () => {
    console.log(`\x1b[32m${clientName} \x1b[33mrunning...\x1b[0m`);
  });

  client.on('message', message => {
    

    console.log(`\x1b[33m${clientName}:\x1b[0m ${message.from} say ${message.body}`);
  });

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
  },
  {
    name: 'start',
    description: 'Start a client',
    arguments: [
      {
        name: '<clientId>',
        description: 'Client ID',
      }
    ],
    options: [
    ],
    action: startClient
  }
];

exports.commands = commands;