import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter);

//Import Components
Vue.component('cueButton', require('./cueButton.vue'));

//Import Route Components
import pgDisconnected from './pgDisconnected.vue';
import pgLocked from './pgLocked.vue';

const routes = [
	{ path: '/disconnected', component: pgDisconnected },
	{ path: '/locked', component: pgLocked }
]

const router = new VueRouter({
	routes
})

//Websockets for communicating with server
var ws;
var reconnectTimer=0;

function connectWebsocket() {
	ws = new WebSocket('ws://'+window.config.websocket_server);
	ws.onopen = function() {
		app.$data['connected'] = true;
		console.log('Connected to socket');
		
		//Clear the reconnect timer if we are reconnecting
		if(window.reconnectTimer){
		   window.clearInterval(window.reconnectTimer);
		   window.reconnectTimer=0;
		}

		//Get initial information
		ws.send('{"cmd":"getActiveCuelists"}');
		//setTimeout(function() {ws.send('{"cmd":"getAllCuelists"}')}, 500); 
	}
	
	ws.onmessage = function(e) {
		app.$data['output'] += e.data + '\n';
		var data = JSON.parse(e.data);
		console.log(e.data);
		
		//Update cuelists
		if (data.allCuelists != undefined) {
			app.$data['allCuelists'] = data.allCuelists;
		}
		if (data.activeCuelists != undefined) {
			app.$data['activeCuelists'] = data.activeCuelists;
		}
	}
	
	ws.onclose = function() {
		app.$data['connected'] = false;
		console.log('Websocket Disconnected. Attempting to reconnect.');
		
		//Start a timer to reconnect, if one hasn't already been started
		if(!window.reconnectTimer){
			window.reconnectTimer=setInterval(function(){connectWebsocket()}, 5000);
		}
	}
}
function sendCommand(cmd) {
	ws.send('{"cmd":"'+cmd+'"}');
}

//Create the Vue object
const app = new Vue({
	el: '#app',
	router,
	data: {
		'window' : window,
		'connected' : false,
		'output': 'Server log:\n',
		'activeCuelists' : [],
		'allCuelists' : []
	},
	mounted: function() {
		connectWebsocket();
	}
})