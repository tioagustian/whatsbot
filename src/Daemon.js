const pm2 = require('pm2');

exports.Daemon = class Daemon {
  options = {};
  constructor(options) {
    this.options = options;
  }

  async start() {
    return new Promise((resolve, reject) => {
      const that = this;
      pm2.connect(function (err) {
        if (err) {
          reject(err);
          process.exit(2);
        }
        pm2.start({
          script: `${__dirname}/process.js`,
          name: that.options.clientId,
          args: [
            'start',
            that.options.clientName,
            JSON.stringify(that.options)
          ],
          exec_mode: 'cluster_mode',
          instances: 1,
        }, function (err, apps) {
          if (err) {
            reject(err);
            return pm2.disconnect();
          }
        });
      })
      pm2.launchBus(function(err, pm2_bus) {
        pm2_bus.on('process:msg', function(packet) {
          if (packet.data.status) {
            resolve(packet);
          } else if (packet.data.type == 'qr') {
            console.log(packet.data.qr);
          } else {
            console.log(packet.data.message);
          }
        });
      })
    });
  }

  async stop() {
    return new Promise((resolve, reject) => {
      const that = this;
      pm2.connect(function (err) {
        if (err) {
          reject(err);
          process.exit(2);
        }
        pm2.stop(that.options.clientId, function (err) {
          if (err) {
            pm2.disconnect();
            reject(err);
          }
          resolve({data: {status: 'offline'}});
        });
      })
    });
  }

  async restart() {
    return new Promise((resolve, reject) => {
      const that = this;
      pm2.connect(function (err) {
        if (err) {
          reject(err);
          process.exit(2);
        }
        pm2.restart(that.options.clientId, function (err) {
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
            } else {
              console.log(packet.data.message);
            }
          })
        });
      })
    });
  }
}
