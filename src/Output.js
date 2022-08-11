const pm2 = require('pm2');

exports.output = function(data) {
  if (data.type === 'qr') {
    data.output = data.qr;
  } else {
    data.output = data.message;
  }
  process.send({
    type : 'process:msg',
    data : data
  })
}