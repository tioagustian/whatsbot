const ping = function (handler) {
  handler.reply(message.from, 'pong');
}

exports.ping = ping;