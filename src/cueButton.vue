<template>
	<div class="info-box" :data-cue="cue" @click="toggleCue()">
		<span class="info-box-icon" :class="color"><i class="fa" :class="icon"></i></span>

		<div class="info-box-content">
			<span class="info-box-text">{{type}}</span>
			<span class="info-box-number">{{name}}</span>
			<span class="label bg-yellow" v-if="fading">FADING</span>
			<span class="label bg-green" v-if="isActive()">ACTIVE</span>
		</div>
    </div>
</template>

<script>
module.exports = {
	props: {
		'cue' : {
			type: Number,
			required: true
		},
		'color' : {
			default: "bg-blue"
		},
		'icon' : {
			default: "fa-lightbulb-o"
		},
		'name' : {
			required: true
		},
		'type' : {
			default: "Presets"
		},
	},
	data: function() {
		return {
			'fading' : false
		}
	},
	methods: {
		toggleCue: function() {
			//window.ws.send('{"cmd":"GQL '+this.$props.cue+'"}');
			this.$root.sendCommand('cuelistGo ' + this.$props.cue);
			this.$data.fading = true;
			var data = this.$data;
			setTimeout(function() { data.fading = false; }, 5000);
		},
		isActive: function() {
			var active = false;
			var props = this.$props;
			var data = this.$data;
			this.$root.activeCuelists.forEach(function(each) {
				if (each.id == props.cue) { active = true; data.fading = false; }
			});
			return active;
		}
	}
}
</script>