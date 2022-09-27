const fs = require('fs');

const { Location: WWJsLocation, MessageMedia: WWJsMessageMedia, Buttons: WWJsButtons, List: WWJsList } = require('whatsapp-web.js');
class WhatsBot {
  constructor(clientName){
    if(clientName.includes('-whatsbot')){
      this.clientName = clientName.replace('-whatsbot', '');
      this.clientId = clientName
    } else {
      this.clientName = clientName;
      this.clientId = `${clientName}-whatsbot`;
    }
    
    if (!fs.existsSync(`${process.cwd()}/.whatsbot/clients.json`)) {
      console.error('Error: no clients found. Please run "npx whatsbot new" to create a new client.');
      process.exit(1);
    }

    const clients = require(`${process.cwd()}/.whatsbot/clients.json`);
    this.client = clients.find(client => client.id == this.clientId);
  }

  async connect(clientId = this.clientId) {
    return new Promise((resolve, reject) => {
      const that = this;
      pm2.connect(function (err) {
        if (err) {
          reject(err);
          process.exit(2);
        }
        pm2.restart(that.options.processId, function (err) {
          if (err) {
            pm2.disconnect();
            reject(err);
          }
        });
        pm2.launchBus(function(err, pm2_bus) {
          pm2_bus.on('process:msg', function(packet) {
            if (packet.data.status) {
              resolve(packet);
            } else if (packet.data.type == 'qr') {
              console.log(packet.data.qr);
            } else if(packet.data.type == 'error') {
              reject(packet);
            } else {
              console.log(packet.data.message);
            }
          })
        });
      })
    });
  }
}

class Location extends WWJsLocation {
  constructor(latitude, longitude, name = null) {
    super(latitude, longitude, name);
  }
}

class MessageMedia extends WWJsMessageMedia {
  constructor(mimetype, data, filename) {
    super(mimetype, data, filename);
  }
}

class Buttons extends WWJsButtons {
  constructor(body, buttons, title = null, footer = null) {
    super(body, buttons, title, footer);
  }
}

class List extends WWJsList {
  constructor(body, buttons, title = null, footer = null) {
    super(body, buttons, title, footer);
  }
}

module.exports = {
  WhatsBot: WhatsBot,
  Location: Location,
  MessageMedia: MessageMedia,
  Buttons: Buttons,
  List: List
};