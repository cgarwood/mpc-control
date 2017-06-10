<template>
	<div class="info-box" :data-cue="cue">
		<span class="info-box-icon" :class="color"><i class="fa" :class="icon"></i></span>

		<div class="info-box-content">
			<span class="info-box-text">{{type}}</span>
			<span class="info-box-number">{{name}}</span>
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
		}
	}
}
</script>