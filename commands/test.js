const justTest = (handler) => {
  console.log('just test');
  return handler.reply('just test');
}

exports.justTest = justTest;