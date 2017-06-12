<template>
	<div class="pg">
	<ul class="stats">
		<li>
			<i v-if="connectedWebsocket" class="fa fa-check-circle" style="color: green;"></i>
			<i v-if="!connectedWebsocket" class="fa fa-times-circle" style="color: red;"></i>
			Server: {{config.websocket_server}}
		</li>
		<li>
			<i v-if="connectedTelnet && connectedWebsocket" class="fa fa-check-circle" style="color: green;"></i>
			<i v-if="!connectedTelnet && connectedWebsocket" class="fa fa-times-circle" style="color: red;"></i>
			<i v-if="!connectedWebsocket" class="fa fa-question-circle" style="color: #f39c12;"></i>
			MxManager
		</li>
		<li>
			<i v-if="connectedMPC && connectedTelnet && connectedWebsocket" class="fa fa-check-circle" style="color: green;"></i>
			<i v-if="!connectedMPC && connectedTelnet" class="fa fa-times-circle" style="color: red;"></i>
			<i v-if="!connectedTelnet || !connectedWebsocket" class="fa fa-question-circle" style="color: #f39c12;"></i>
			MPC
		</li>
		<li><a data-toggle="modal" data-target="#connectionTroubleshooter">Troubleshoot Connection Issues</a></li>
	</ul>
	<div class="lockscreen-wrapper">
		<div class="lockscreen-logo">Connection Lost</div>

		<div class="text-center" style="margin-bottom: 24px;">
			Connection to the server has been lost. Attempting to reconnect.
		</div>
		<p class="text-center" style="font-size: 36px; margin-bottom: 24px;">
			<i class="fa fa-refresh fa-spin"></i>
		</p>
		<p class="text-center"><a data-toggle="modal" data-target="#manualLights">Need to manually activate the lights?</a></p>
	</div>

	<!-- Modal -->
	<div class="modal fade" id="manualLights" tabindex="-1" role="dialog" >
		<div class="modal-dialog" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
					<h4 class="modal-title">Manual Light Control</h4>
				</div>
				<div class="modal-body">
					<p>A manual light control switch is located in the A/V booth. Go into the A/V booth and look for the following switch (usually on the counter between the two sets of computer monitors)</p>
					<img src="/static/manual-light-panel.png" align="left" height="200" style="margin-right: 24px;" />
					<ul>
						<li>Press the <b>white</b> button (<b>#7</b>) to turn all house lights on.</l i>
						<li>Press the <b>black</b> button (<b>#8</b>) to turn all house lights off.</li>
						<li>Press the <b>gray</b> buttons (<b>#1</b> & <b>#2</b>, <b>#3</b> & <b>#4</b>, etc.) to dim individual sections of lights.</li>
						<li>The other colored buttons activate a variety of preset light levels</li>
					</ul>
					<p>There is a separate light switch on the right side of the stage in front of the drum cage to turn on overhead stage lights.</p>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Modal -->
	<div class="modal fade" id="connectionTroubleshooter" tabindex="-1" role="dialog">
		<div class="modal-dialog" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
					<h4 class="modal-title">Troubleshoot Connection Issues</h4>
				</div>
				<div class="modal-body">
					<p>A <i class="fa fa-times-circle" style="color: red;"></i> next to "Server" in the top right corner means the control server for the wall panels is unreachable. Ensure the wall panel is connected to wifi and the lighting PC is turned on in the A/V booth.</p>
					<p>A <i class="fa fa-times-circle" style="color: red;"></i> next to "MxManager" in the top right corner means the control server can not talk to the lighting software. Check the lighting computer in the A/V booth and make sure the M-PC and M-Series Manager applications are both running.</p>
					<p>A <i class="fa fa-times-circle" style="color: red;"></i> next to "MPC" in the top right corner means the lighting software is not running or unresponsive. Check the lighting computer in the A/V booth and make sure M-PC is running.</p>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
				</div>
			</div>
		</div>
	</div>
</div>
</template>

<script>
	module.exports = {
		computed: {
			connectedWebsocket: function() {
				return this.$parent.$data.connectedWebsocket;
			},
			connectedTelnet: function() {
				return this.$parent.$data.connectedTelnet;
			},
			connectedMPC: function() {
				return this.$parent.$data.connectedMPC;
			},
			config: function() {
				return window.config;
			}
		}
	}
</script>