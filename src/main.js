//Import Vue 
import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter);

//Import Components
Vue.component('cueButton', require('./cueButton.vue'));
Vue.component('cueFader', require('./cueFader.vue'));

//Import Route Components
import pgDisconnected from './pgDisconnected.vue';
import pgLocked from './pgLocked.vue';
import pgControls from './pgControls.vue';

//Setup Vue Routes
const routes = [
	{ path: '/disconnected', component: pgDisconnected },
	{ path: '/locked', component: pgLocked },
	{ path: '/controls', component: pgControls }
];

const router = new VueRouter({
	routes
});

//Websockets for communicating with server
var ws;
var reconnectTimer=0;

function connectWebsocket() {
	ws = new WebSocket('ws://'+window.config.websocket_server);
	ws.onopen = function() {
		app.$data['connectedWebsocket'] = true;
		console.log('Connected to socket');
		
		//Clear the reconnect timer if we are reconnecting
		if(window.reconnectTimer){
		   window.clearInterval(window.reconnectTimer);
		   window.reconnectTimer=0;
		}

		//Get initial information
		ws.send('{"cmd":"getActiveCuelists"}');
	}
	
	ws.onmessage = function(e) {
		var data = JSON.parse(e.data);
		console.log(e.data);
				
		//Update cuelists
		if (data.allCuelists !== undefined) {
			app.$data['allCuelists'] = data.allCuelists;
		}
		if (data.activeCuelists !== undefined) {
			app.$data['cuelistsLoaded'] = true;
			app.$data['activeCuelists'] = data.activeCuelists;
			
			//Loop to check for the lockout cuelist
			var lockedOut = false;
			app.$data['activeCuelists'].forEach(function(cl) {
				if (cl.id == window.config.lockout_cuelist) {  lockedOut = true; }
			});
			app.$data['lockedOut'] = lockedOut;
			
			if (lockedOut && !app.$data.manuallyUnlocked) { router.replace('/locked'); } else { router.replace('/controls'); }
			
			//If no longer locked out, reset the manuallyUnlocked key
			if (lockedOut == false) { app.$data.manuallyUnlocked = false; }
		}
		if (data.connectedTelnet !== undefined) {
			app.$data['connectedTelnet'] = data.connectedTelnet;
		}
		if (data.connectedMPC !== undefined) {
			app.$data['connectedMPC'] = data.connectedMPC;
		}
		
		if (app.$data['connectedWebsocket'] === false || app.$data['connectedTelnet'] === false || app.$data['connectedMPC'] === false) {
			if (app.$route.path != '/disconnected') {
				router.replace('/disconnected');
			}
		}
		if (app.$data['connectedWebsocket'] === true && app.$data['connectedTelnet'] === true && app.$data['connectedMPC'] === true) {
			if (app.$route.path == '/disconnected') {
				router.replace('/controls');
			}
		}
	}
	
	ws.onclose = function() {
		app.$data['connectedWebsocket'] = false;
		
		// Redirect to disconnected page
		if (app.$route.path != '/disconnected') {
			router.replace('/disconnected');
		}
		
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
		'config' : window.config,
		'connectedWebsocket' : false,
		'connectedTelnet' : false,
		'connectedMPC' : false,
		'activeCuelists' : [],
		'allCuelists' : [],
		'lockedOut' : false,
		'manuallyUnlocked' : false,
		'cuelistsLoaded' : false
	},
	mounted: function() {
		connectWebsocket();
	},
	methods: {
		sendCommand: function(cmd) {
			ws.send('{"cmd":"'+cmd+'"}');
		},
		manuallyUnlock: function(unlock_code) {
			this.$data.manuallyUnlocked = true;
			router.replace('/controls');
		},
		manuallyLock: function() {
			this.$data.manuallyUnlocked = false;
			router.replace('/locked');
		}
	}
})