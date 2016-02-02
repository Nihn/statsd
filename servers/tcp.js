var net  = require('net');
var fs = require('fs');

function rinfo(tcpstream, data) {
    this.address = tcpstream.remoteAddress;
    this.port = tcpstream.remotePort;
    this.family = tcpstream.address().family;
    this.size = data.length;
}

exports.start = function(config, callback) {
  var server = net.createServer(function(stream) {
      stream.setEncoding('ascii');

      var buffer = '';
      stream.on('data', function(data) {
          buffer += data;
          var offset = buffer.lastIndexOf("\n");
          if (offset > -1) {
             var packet = buffer.slice(0, offset + 1);
             buffer = buffer.slice(offset + 1);
             callback(packet, new rinfo(stream, packet));
          }
      });
  });

  server.on('listening', (e) => {
    config.socket && config.socket_mod && fs.chmod(config.socket, config.socket_mod);
  });

  process.on('exit', (e) => {
      config.socket && fs.unlinkSync(config.socket);
  })

  server.listen(config.socket || config.port || 8125, config.address || undefined);
  this.server = server;
  return true;
};
