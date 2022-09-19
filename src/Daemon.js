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
          script: `${__dirname}/Process.js`,
          name: that.options.processId,
          args: [
            'start',
            that.options.clientName,
            JSON.stringify(that.options)
          ],
          exec_mode: 'cluster_mode',
          instances: 1,
          autorestart: false,
        });
      })
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
        pm2.stop(that.options.processId, function (err) {
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

  async delete() {
    return new Promise((resolve, reject) => {
      const that = this;
      pm2.connect(function (err) {
        if (err) {
          reject(err);
          process.exit(2);
        }
        pm2.delete(that.options.processId, function (err) {
          if (err) {
            pm2.disconnect();
            reject(err);
          }
          resolve({data: {status: 'offline'}});
        });
      })
    });
  }
}
