var config = require('./server-config')
  , fs = require('fs')
  , url = require('url')
  , qs = require('querystring')
  , path = require('path')
  , ws_port = config.ws_port;

  
//Set up WebSocket server
const WebSocket = require('ws');
const wss = new WebSocket.Server({port:ws_port});

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
let poll_in = 500;
let dynamic_heartbeat = (config.polling_interval === undefined);

console.log('> Starting server...');

//Static page handler
function webHandler(req, res) {
	
    query = qs.parse(url.parse(req.url).query);

    //Default to index.html
    if("/" === req.url)
    	req.url = "/index.html";

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
	tnc.connect(get_telnet_connect_settings());
	
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
    heartbeat();
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
        if(dynamic_heartbeat)
			mxGetActiveCuelists();
        else
        	setTimeout(function(){
        		mxGetActiveCuelists();
			}, 500);
	}

	setTimeout(function(){
		heartbeat();
	}, poll_in)
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
	run_telnet('Status', process_mxStatus);
}
function process_mxStatus(lines,command){
    broadcast(lines);
}

function mxGetAllCuelists() {
	run_telnet('QLList', process_mxGetAllCuelists);
}
function process_mxGetAllCuelists(lines, command){
    console.log('>> QLList');
    let cuelists = [];
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
}

function mxGetActiveCuelists() {
    run_telnet('QLActive', process_mxGetActiveCuelists)
}

function process_mxGetActiveCuelists(lines,command){
    let start_time = Date.now();
    console.log('>> QLActive');
    let activeCuelists = [];
    lines.forEach(function each(line) {
        switch (line) {
            case "200 Ok":
            case "200 ":
            case ".":
            case "":
            case "No Active Qlist in List":
                break;
            default:
                let id = parseInt(line.substring(0,5));
                let title = line.substring(8);
                activeCuelists.push({'id':id,'title':title});
                break;
        }
    });
    broadcast({'cmd':'getActiveCuelists','activeCuelists':activeCuelists});


    if(dynamic_heartbeat){
        let time_taken = Date.now() - start_time;
        poll_in = get_value_between( time_taken *config.polling_multiplier, config.polling_min, config.polling_max );
    }
}

function mxCuelistGo(number) {
	run_telnet('GQL ' + number,process_mxCuelistGo );
}

function process_mxCuelistGo(lines, command){
    console.log('>> ' + command);
	lines.forEach(function each(line) {
		if (line.slice(-9) === "not found") {
			console.log('ERROR: CL ' + command + ' not found');
		}
	});
}

function mxCuelistRelease(number) {
    run_telnet('RQL ' + number,process_mxCuelistRelease);
}

function process_mxCuelistRelease(lines,command){
    console.log('>> ' + command);
	lines.forEach(function each(line) {
		if (line.slice(-9) == "not found") {
			console.log('ERROR: CL ' + number + ' not found');
		}
	});
}

function get_telnet_connect_settings(){
	return {
        host: config.mxmanager_ip,
        port: config.mxmanager_port,
        shellPrompt: '',
        timeout: 1500,
        negotiationMandatory: false
    }
}

function get_value_between(number,min,max){
	if(number < min)
		return min;
	else if(number > max)
		return max;
	else
		return number;
}

function run_telnet(command,callback){
    let telnet_connection = new telnet();
    telnet_connection.connect(get_telnet_connect_settings())
        .then(function(){
            telnet_connection.send(command, {waitfor:'.\r\n'})
                .then(function(d){
					telnet_connection.end();
					let lines = d.split('\r\n');
					//Remove first 2 welcome lines
					delete lines[0];
					delete lines[1];
					callback(lines,command);
				},
				function(err){
					console.log('Error connecting to telnet: ' . err);
				})
        });
}