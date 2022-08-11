const args = process.argv.slice(2);
const { Client, NoAuth, LocalAuth, LegacySessionAuth } = require('whatsapp-web.js');
const options = args[2] ? JSON.parse(args[2]) : {};
const clientId = options.clientId;
const clientName = options.clientName;
const qrcode = require('qrcode-terminal');
const Handler = require('./Handler');

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
    authStrategy: new LocalAuth({clientId: clientId}),
    puppeteer: { handleSIGINT: false}
  });
}
client.on('qr', qr => {
  qrcode.generate(qr, {small: true}, function(qrcode) {
    output({type: 'qr', qr: qrcode});
  });
});

client.on('ready', () => {
  output({message: `\x1b[32mSuccessfully authorized!\x1b[0m`});
  output({message: `\x1b[32mClient: \x1b[33m${clientName}\x1b[0m`});
  output({message: `\x1b[32mClient ID: \x1b[33m${clientId}\x1b[0m`});
  output({status: 'online', message: `\x1b[32m${clientName} running...\x1b[0m`});
});

client.on('message', message => {
  output(`\x1b[33mwhatsbot@${clientName}:\x1b[0m ${message.from} say ${message.body}`);
  let handler = new Handler({client: client, message: message, clientName: clientName, clientId: clientId});
  console.log(handler.handle());
});
client.initialize();

output = function(data) {
  console.log(data);
  process.send({
    type : 'process:msg',
    data : data
  })
}

sendClient = function(data) {
  data.type = 'message';
  console.log(`\x1b[33mwhatsbot@${data.clientName}:\x1b[0m ${data.message.from} say ${data.message.body}`);
  process.send({
    type : 'process:msg',
    data : data
  })
}