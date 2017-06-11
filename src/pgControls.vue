<template>
	<div class="row">
		<div class="col-md-4">
			<cue-button :cue="201" name="House Full" type="House Lights" color="bg-yellow"></cue-button>
			<cue-button :cue="202" name="House Half" type="House Lights" color="bg-yellow"></cue-button>
			<cue-button :cue="203" name="House Low" type="House Lights" color="bg-yellow"></cue-button>
			<cue-button :cue="200" name="House Off" type="House Lights" color="bg-red" icon="fa-power-off"></cue-button>
		</div>
		<div class="col-md-4">
			<cue-button :cue="1" name="Front Lights" type="Stage Lighting" icon="fa-sun-o"></cue-button>
			<cue-button :cue="31" name="Backdrop Colors" type="Stage Lighting" icon="fa-sun-o"></cue-button>
			<cue-button :cue="27" name="Backdrop White" type="Stage Lighting" icon="fa-sun-o"></cue-button>
		</div>
		<div class="col-md-4">
			<cue-button :cue="12" name="Pre/Post Service" type="Presets" color="bg-green"></cue-button>
			<cue-button :cue="13" name="Worship" type="Presets" color="bg-green"></cue-button>
			<cue-button :cue="14" name="Sermon" type="Presets" color="bg-green"></cue-button>
			<cue-button :cue="11" name="All Off" type="Presets" color="bg-red" icon="fa-power-off"></cue-button>
		</div>
	</div>
</template>

<script>
</script>