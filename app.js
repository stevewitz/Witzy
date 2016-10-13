server = require('./witzyserver')
server.start(receivedcommand,8201);
server.send({console:"Witzy server UP",serverup:true})
// captures errors and ctrl-c's
process.stdin.resume();

server.cleanup();


function receivedcommand(o){



}
