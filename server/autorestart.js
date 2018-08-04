const { spawn } = require('child_process');

server_autorestart();
function server_autorestart(){
    const server = spawn('node', ['server.js']);
    console.log("Server Started!");
    server.on('exit', function(err){
        console.log("Server crashed, attempting restart.");
        server_autorestart();
    });
}

