var config = require('./server-config')
  , fs = require('fs')
  , url = require('url')
  , qs = require('querystring')
  , path = require('path');

  
//Set up WebSocket server
const WebSocket = require('ws');
const wss = new WebSocket.Server({port:8082});

//Set up standard Web server
var server = require('http').createServer(webHandler);
server.listen(config.http_port);
var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"
};
//Set up telnet client for talking to MxManager
var telnet = require('telnet-client');
var tnc = new telnet();
var reconnectTimer = 0;
var heartbeatTimer = 0;

console.log('> Starting server...');

//Static page handler
function webHandler(req, res) {
	
    query = qs.parse(url.parse(req.url).query);
	// attempt to serve static files
	var file = path.normalize(__dirname + '/../' + req.url);
	fs.readFile(file, function (err, data)
	{
		if (err)
		{
			res.writeHead(404);
			return res.end();
		}
		var mimeType = mimeTypes[file.split('.').pop()];
		if (!mimeType) { mimeType = 'text/plain'; }
		res.writeHead(200, {"Content-Type":mimeType});
		return res.end(data);
	});
}

// Set some variables for tracking connection status
var connectedMPC = false;
var connectedTelnet = false;

// Other MPC global variables
var activeCuelists = [];

// Connect to MxManager Telnet
connectTelnet();
function connectTelnet() {
	console.log('> Connecting to MxManager Telnet');
	tnc.connect({
		host: config.mxmanager_ip,
		port: config.mxmanager_port,
		shellPrompt: '',
		timeout: 1500,
		negotiationMandatory: false
	});
	
	//Clear the reconnect timer if we are reconnecting
	if(reconnectTimer){
	   clearInterval(reconnectTimer);
	   reconnectTimer=0;
	}
}

tnc.on('ready', function(prompt) {
	connectedTelnet = true;
	broadcast({'connectedTelnet':connectedTelnet});
	
	console.log('> Telnet Connection Established');
	
	//Start a loop to poll MxManager for data
	heartbeatTimer = setInterval(function() { if (connectedTelnet) { heartbeat();} }, config.polling_interval);
});

//This timeout function seems to always be called, but the connection stays active.
//tnc.on('timeout', function() {
//	console.log('Telnet connection timed out');
//	broadcast('Telnet connection timed out');
//});

tnc.on('close', function() {
	connectedTelnet = false;
	console.log('> Telnet connection closed');
	broadcast({'connectedTelnet':connectedTelnet});
	
	//Start a timer to reconnect, if one hasn't already been started
	if(!reconnectTimer){
		reconnectTimer=setInterval(function(){connectTelnet()}, 5000);
	}
	clearInterval(heartbeatTimer);
});

tnc.on('error', function(e) {
	console.log(e);
});


wss.on('connection', function connection(ws, req) {
  console.log('> New websocket connection from ' + req.connection.remoteAddress);
  
  ws.on('message', function incoming(message) {
    console.log('> received: %s', message);
	handleEvent(message);
  });

});

function handleEvent(data) {
	data = JSON.parse(data);
	
	cmd = data['cmd'].split(' ');
	
	if (cmd[0] !== undefined) {
		switch(cmd[0]) {
			case "status":
				mxStatus();
				break;
			case "getActiveCuelists":
				mxGetActiveCuelists();
				break;
			case "getAllCuelists":
				mxGetAllCuelists();
				break;
				
			case "cuelistGo":
				mxCuelistGo(cmd[1]);
				break;
			case "cuelistRelease":
				mxCuelistRelease(cmd[1]);
				break;
		}
	}
}

function broadcast(d) {
	wss.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			var settings = {
				'connectedTelnet': connectedTelnet,
				'connectedMPC': connectedMPC,
				'updatedAt': Date.now()
			};
			if (typeof(d) == "string") {
				data = Object.assign({'data': d},settings);
				client.send(JSON.stringify(data));
			} else {
				data = Object.assign(d,settings);
				client.send(JSON.stringify(data));
			}
		}
	});
}

function heartbeat() {
	mxIsMxRunning();
	if (connectedMPC) {
		setTimeout(function() {mxGetActiveCuelists();}, 500);
	}
}

//MxManager Functions
function mxIsMxRunning() {
	console.log('>> IsMXRun');
	tnc.send('IsMXRun', {waitfor:'.\r\n'}, function(e,d) {
		var lines = d.split('\r\n');
		lines.forEach(function each(line) {
			switch (line) {
				case "200 Ok":
				case ".":
				case "":
					break;
				case "Yes":
					connectedMPC = true;
					break;
				case "No":
					connectedMPC = false;
					break;
				
			}
		});
	});
}
function mxStatus() {
	console.log('>> Status');
	tnc.send('Status', {waitfor:'.\r\n'}, function(e,d) {
		broadcast(d);
	});
}
function mxGetAllCuelists() {
	console.log('>> QLList');
	tnc.send('QLList', {waitfor:'.\r\n'}, function(e,d) {
		var lines = d.split('\r\n');
		var cuelists = [];
		lines.forEach(function each(line) {
			switch (line) {
				case "200 Ok":
				case ".":
				case "":
					break;
				default:
					var id = line.substring(0,5);
					var title = line.substring(8);
					cuelists.push({'id':id,'title':title});
					break;
			}
		});
		broadcast({'cmd':'getAllCuelists','allCuelists':cuelists});
	});
}
function mxGetActiveCuelists() {
	console.log('>> QLActive');
	tnc.send('QLActive', {waitfor:'.\r\n'}, function(e,d) {
		var lines = d.split('\r\n');
		activeCuelists = [];
		lines.forEach(function each(line) {
			switch (line) {
				case "200 Ok":
				case ".":
				case "":
				case "No Active Qlist in List":
					break;
				default:
					var id = line.substring(0,5);
					var title = line.substring(8);
					activeCuelists.push({'id':id,'title':title});
					break;
			}
		});
		broadcast({'cmd':'getActiveCuelists','activeCuelists':activeCuelists});
	});
}

function mxCuelistGo(number) {
	console.log('>> GQL ' + number);
	tnc.send('GQL ' + number, {waitfor:'.\r\n'}, function(e,d) {
		var lines = d.split('\r\n');
		lines.forEach(function each(line) {
			if (line.slice(-9) == "not found") {
				console.log('ERROR: CL ' + number + ' not found');
			}
			if (line.substring(0,6) == "QList:") {
				//mxGetActiveCuelists() won't show an active cue until it has finished fading in
				var id = line.substring(7,11);
				var title = line.substring(13,line.length-8);
				activeCuelists.push({'id':id,'title':title});
				broadcast({'cmd':'getActiveCuelists','activeCuelists':activeCuelists});
			}
		});
	});
}

function mxCuelistRelease(number) {
	console.log('>> RQL ' + number);
	tnc.send('RQL ' + number, {waitfor:'.\r\n'}, function(e,d) {
		var lines = d.split('\r\n');
		lines.forEach(function each(line) {
			if (line.slice(-9) == "not found") {
				console.log('ERROR: CL ' + number + ' not found');
			}
		});
	});
}