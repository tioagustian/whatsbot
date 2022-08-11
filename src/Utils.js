const output = function(data) {
  console.log(data);
  process.send({
    type : 'process:msg',
    data : data
  })
}

module.exports = {
  output: output
}