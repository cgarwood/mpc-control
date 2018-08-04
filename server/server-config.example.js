// Server Configuration
module.exports = {
	// Port for HTTP server the tablets will connect to
	http_port : 80,

	// Websocket Port that the website connects to, needs to be the same as in config.js
	ws_port : 8082,
	
	// IP and port for the Martin MxManager Telnet Server
	mxmanager_ip : "127.0.0.1",
	mxmanager_port : 2323,
	
	// How often to poll MxManager for active status/running cuelists
	polling_interval: 4000
}
