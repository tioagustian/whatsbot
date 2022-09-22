const args = process.argv.slice(2);
const { Client, NoAuth, LocalAuth, LegacySessionAuth } = require('whatsapp-web.js');
const { output } = require('./Utils');
const options = args[2] ? JSON.parse(args[2]) : {};
const clientId = options.clientId;
const clientName = options.clientName;
const qrcode = require('qrcode-terminal');
const Handler = require('./Handler');
const Whatsbot = require('./Whatsbot');

let client = [];

if(options.auth === false) {
  client = new Client({
    authStrategy: new NoAuth(),
    puppeteer: { handleSIGINT: false, args: ['--no-sandbox']}
  });
} else if(options.auth === 'legacy') {
  client = new Client({
    authStrategy: new LegacySessionAuth(),
    puppeteer: { handleSIGINT: false, args: ['--no-sandbox']}
  });
} else {
  client = new Client({
    authStrategy: new LocalAuth({clientId: clientId}),
    puppeteer: { handleSIGINT: false, args: ['--no-sandbox']}
  });
}
client.on('qr', qr => {
  qrcode.generate(qr, {small: true}, function(qrcode) {
    output({qr: qrcode}, 'qr');
  });
});

client.on('ready', () => {
  output({message: `\x1b[32mSuccessfully authorized!\x1b[0m`});
  output({message: `\x1b[0mClient: \x1b[33m${clientName}\x1b[0m`});
  output({message: `\x1b[0mClient ID: \x1b[33m${clientId}\x1b[0m`});
  output({status: 'online', message: `\x1b[32m${clientName} running...\x1b[0m`});
});

const handler = new Handler(new Whatsbot(client, clientName, clientId));

client.on('message', async message => {
  
  if (message.hasMedia) {
    output(`\x1b[33m${clientName}@whatsbot:\x1b[0m ${message.from} send media`);
    const media = await message.downloadMedia();
    await handler.handleMedia(message, media);
  } else {
    output(`\x1b[33m${clientName}@whatsbot:\x1b[0m ${message.from} say ${message.body}`);
    await handler.handle(message);
  }
  
});
client.initialize();