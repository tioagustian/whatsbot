const output = function(data, type = 'message') {
  data.type = data.type || type;
  if (data.type === 'error') {
    console.error(data.message);
  } else {
    console.log(data);
  }
  process.send({
    type : 'process:msg',
    data : data
  })
}

module.exports = {
  output: output
}