const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { Client, NoAuth, LocalAuth, LegacySessionAuth } = require('whatsapp-web.js');
const inquirer = require('inquirer');
const { Daemon } = require('../Daemon');

const newClient = async (clientName = '', options) => {
  
  let clients = [];
  try {
    clients = require(`${__dirname}/../../clients.json`);
  } catch (error) {
    fs.writeFileSync(`${__dirname}/../../clients.json`, JSON.stringify(clients));
  }
  
  if (clientName === '') {
    const questions = [
      {
        type: 'input',
        name: 'clientName',
        message: 'Client name:',
        default: 'client-' + Object.keys(clients).length,
        validate: function(value) {
          const pass = value.match(/^[a-zA-Z0-9_-]+$/);
          if (pass) {
            return true;
          }
          return 'Please enter only letters, numbers, and underscores!';
        }
      },
      {
        type: 'list',
        name: 'auth',
        message: 'Authentication:',
        choices: ['No Authentication', 'Local Authentication', 'Legacy Session Authentication'],
        default: 'Local Authentication'
      }
    ];
    const authList = {'No Authentication': false, 'Local Authentication': 'local', 'Legacy Session Authentication': 'legacy'};
    const answers = await inquirer.prompt(questions);
    clientName = answers.clientName;
    options = {
      auth: authList[answers.auth]
    };
  } else {
    const pass = clientName.match(/^[a-zA-Z0-9_]+$/);
    if (!pass) {
      console.log('Please enter only letters, numbers, and underscores!');
      process.exit(1);
    }
  }

  if (clients.some(client => client.name === clientName)) {
    console.log(`Client '${clientName}' already exists!`);
    process.exit(1);
  }

  if(options.config != undefined) {
    options.config = `${process.cwd()}/${options.config}`;
  }

  console.log(`Starting client '${clientName}'...`);
  const clientId = `${clientName}-whatsbot`;
  const processId = `${Date.now()}@whatsbot-process`;
  const daemon = new Daemon({processId: processId, clientId: clientId, clientName: clientName, options: options});
  process.on('SIGINT', async function() {
    await daemon.stop();
    console.log('Aborted!');
    process.exit();
  });

  try {
    const data = await daemon.start();
  } catch (error) {
    if (error.data.type === 'error') {
      console.log(error.data.message);
      await daemon.delete();
      process.exit(1);
    }
  }
  
  if (data.data.status === 'online') {
    const client = {
      id: clientId,
      name: clientName,
      options: options,
      processId: processId,
      process: data.process,
      status: 'online',
      at: data.at
    }
    clients.push(client);
    fs.writeFileSync(`${__dirname}/../../clients.json`, JSON.stringify(clients, null, 2));
    process.exit(1);
  }
}

const startClient = async (clientName = 'client_0') => {
  let clients = [];
  try {
    clients = require(`${__dirname}/../../clients.json`);
  } catch (error) {
    console.log(`No clients file found!`);
    process.exit(1);
  }
  const client = clients.find(client => client.name === clientName);
  if(!client) {
    console.log(`Client '${client.name}' does not exist!`);
    process.exit(1);
  }
  if (client.status === 'online') {
    return restartClient(clientName);
  }

  console.log(`Starting client '${client.name}'...`);
  const clientId = client.id;
  const options = client.options;
  const processId = client.processId;
  const daemon = new Daemon({processId: processId, clientId: clientId, clientName: clientName, options: options});
  process.on('SIGINT', async function() {
    await daemon.stop();
    console.log('Aborted!');
    process.exit();
  });
  
  try {
    const data = await daemon.start();
  } catch (error) {
    if (error.data.type === 'error') {
      console.log(error.data.message);
      await daemon.stop();
      process.exit(1);
    }
  }

  if (data.data.status === 'online') {
    client.status = 'online';
    clients = clients.map(c => {
      if (c.name === clientName) {
        client.process = data.process;
        client.at = data.at;
        return client;
      }
      return c;
    });
    console.log(`\x1b[32mClient '${clientName}' is now online!\x1b[0m`);
    fs.writeFileSync(`${__dirname}/../../clients.json`, JSON.stringify(clients, null, 2));
    process.exit(1);
  }
}

const stopClient = async (clientName = 'client_0') => {
  let clients = [];
  try {
    clients = require(`${__dirname}/../../clients.json`);
  } catch (error) {
    console.log(`No clients file found!`);
    process.exit(1);
  }
  const client = clients.find(client => client.name === clientName);
  if(!client) {
    console.log(`Client '${client.name}' does not exist!`);
    process.exit(1);
  }
  if (client.status === 'offline') {
    console.log(`Client '${client.name}' is already offline!`);
    process.exit(1);
  }

  console.log(`Stoping client '${client.name}'...`);
  const clientId = client.id;
  const options = client.options;
  const processId = client.processId;
  const daemon = new Daemon({processId: processId, clientId: clientId, clientName: clientName, options: options});
  const data = await daemon.stop();
  if (data.data.status === 'offline') {
    client.status = 'offline';
    clients = clients.map(c => {
      if (c.name === clientName) {
        return client;
      }
      return c;
    });
    console.log(`Client '${clientName}' is now offline!`);
    fs.writeFileSync(`${__dirname}/../../clients.json`, JSON.stringify(clients, null, 2));
    process.exit(1);
  }
}

const restartClient = async (clientName = 'client_0') => {
  let clients = [];
  try {
    clients = require(`${__dirname}/../../clients.json`);
  } catch (error) {
    console.log(`No clients file found!`);
    process.exit(1);
  }
  const client = clients.find(client => client.name === clientName);
  if(!client) {
    console.log(`Client '${client.name}' does not exist!`);
    process.exit(1);
  }

  console.log(`Restarting client '${client.name}'...`);
  const clientId = client.id;
  const options = client.options;
  const processId = client.processId;
  const daemon = new Daemon({processId: processId, clientId: clientId, clientName: clientName, options: options});
  process.on('SIGINT', async function() {
    await daemon.stop();
    console.log('Aborted!');
    process.exit();
  });
  
  try {
    const data = await daemon.start();
  } catch (error) {
    if (error.data.type === 'error') {
      console.log(error.data.message);
      await daemon.stop();
      process.exit(1);
    }
  }

  if (data.data.status === 'online') {
    client.status = 'online';
    clients = clients.map(c => {
      if (c.name === clientName) {
        return client;
      }
      return c;
    });
    console.log(`\x1b[32mClient '${clientName}' is now online!\x1b[0m`);
    fs.writeFileSync(`${__dirname}/../../clients.json`, JSON.stringify(clients, null, 2));
    process.exit(1);
  }
}

const commands = [
  {
    name: 'new',
    description: 'Create a new client',
    arguments: [
      {
        name: '[clientName]',
        description: 'Client Name',
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
      },
      {
        name: '-c, --config [configurationFile]',
        description: 'Configuration file'
      }
    ],
    action: newClient
  },
  {
    name: 'start',
    description: 'Start a client',
    arguments: [
      {
        name: '<client>',
        description: 'Client ID or name',
      }
    ],
    options: [
    ],
    action: startClient
  },
  {
    name: 'stop',
    description: 'Stop a client',
    arguments: [
      {
        name: '<client>',
        description: 'Client ID or name',
      }
    ],
    options: [
    ],
    action: stopClient
  },
  {
    name: 'restart',
    description: 'Retart a client',
    arguments: [
      {
        name: '<client>',
        description: 'Client ID or name',
      }
    ],
    options: [
    ],
    action: startClient
  },
];

exports.commands = commands;