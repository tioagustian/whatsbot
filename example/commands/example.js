const ping = function (handler, chat) {
  handler.reply('pong!', {}, test);
}

const test = function (handler, chat) {
  handler.reply('test!', {
    test: 'test'
  });
}

exports.ping = ping;
exports.test = test;