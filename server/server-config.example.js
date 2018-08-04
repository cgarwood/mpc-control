// Server Configuration
module.exports = {
	// Port for HTTP server the tablets will connect to
	http_port : 8083,
	
	// IP and port for the Martin MxManager Telnet Server
	mxmanager_ip : "127.0.0.1",
	mxmanager_port : 2323,
	
	// How often to poll MxManager for active status/running cuelists
	polling_interval: 4000,

	//Dynamic Heartbeat, monitors time the heartbeat takes and adjusts it each time
	//To Use dynamic heartbeat remove or comment out polling_interval
    polling_multiplier: 10, //Multiplies time taken to use as heartbeat
    polling_min: 500, //Sets a minimum time to wait for heartbeat
    polling_max: 5000, //Sets a maximum time to wait for heartbeat
}
