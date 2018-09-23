<template>
	<div class="info-box" :data-cue="cue" @click="toggleCue()" v-bind:style="{
                'background-color':backgroundColor,
				'color': textColor
			}">
		<span class="info-box-icon" :class="color"><i class="fa" :class="icon"></i></span>

		<div class="info-box-content">
			<span class="info-box-text">{{type}}</span>
			<span class="info-box-number">{{name}}</span>
			<span class="label bg-yellow" v-if="fading"><i class="fa fa-spinner fa-spin"></i> FADING</span>
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
		'backgroundColor' : {
		    type: String,
		    default: '#fff'
		},
		'textColor' : {
		    default: '#333'
		},
		'method' : {
			default: 'toggle'
		}
	},
	data: function() {
		return {
            'fading': false
		}
	},
	methods: {
		toggleCue: function() {
			switch(this.$props.method){
				case 'toggle':
					if(this.isActive())
					  this.$root.sendCommand('cuelistRelease ' + this.$props.cue);
					else
					  this.$root.sendCommand('cuelistGo ' + this.$props.cue);
					break;
				case 'list':
					this.$root.sendCommand('cuelistGo ' + this.$props.cue);
					break;
				default:
					console.log(`method ${this.$props.method} is not valid`);
			}
			this.$data.fading = true;
			var data = this.$data;
			setTimeout(function() {
			    data.fading = false;
			}, 4000);
		},
		isActive: function() {
			var active = false;
			var props = this.$props;
			this.$root.activeCuelists.forEach(function(each) {
				if (each.id === props.cue) {
				    active = true;
				}
			});
			return active;
		}
	}
}
</script>