var 
  express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server, { log: false })
  , nodeThinkGear = require('node-thinkgear')
  , mySocket = undefined;

app.use(express.static(__dirname + '/public'));

server.listen(3000);

var tgClient = nodeThinkGear.createClient({
	appName:'NodeThinkGear',
	appKey:'0fc4141b4b45c675cc8d3a765b8d71c5bde9390'
});

tgClient.connect();

io.sockets.on('connection', function (socket) {
  console.log("Socket connected!");
  mySocket = socket;
});

tgClient.on('data', function(data) {

  if (data['poorSignalLevel']) {
    console.log("connecting...");
  }
  else if (data['eSense']) {
    console.log(data['eSense']['attention'], data['eSense']['meditation']);
  }

	if (mySocket) {
		mySocket.emit('think', { data: data});
	}
});