<style type="text/css">
.lockscreen-wrapper {
	max-width: 600px;
	color: white;
}
.lockscreen-logo {
	color: white;
}
.lockscreen-item {
	color: white;
}
.lockscreen-credentials {
	margin-left: 0;
}
</style>

<template>
<div class="lockscreen-wrapper">
	<div class="lockscreen-logo">Auditorium Lighting</div>

  	<div class="text-center" style="margin-bottom: 24px;">
		Wall controls are locked out by the lighting console. Please enter the password to unlock.
	</div>

	<div class="lockscreen-item">
		<form @submit.prevent="submitUnlockCode()" class="lockscreen-credentials">
			<div class="input-group">
				<input type="password" v-model="unlock_code" class="form-control" placeholder="password">

				<div class="input-group-btn">
					<button type="button" class="btn" @click="submitUnlockCode()"><i class="fa fa-arrow-right text-muted"></i></button>
				</div>
			</div>
		</form>
	</div>

	<transition name="fade">
		<div class="callout callout-danger" style="margin-bottom: 24px; text-align: center;" v-if="error">
			{{error}}
		</div>
	</transition>
</div>
</template>

<script>
module.exports = {
	data: function() {
		return {
			unlock_code: '',
			error: ''
		}
	},
	methods: {
		submitUnlockCode() {
			if (this.$data.unlock_code == window.config.unlock_code) {
				this.$root.manuallyUnlock();
			} else {
				this.$data.error = 'Incorrect unlock code';
				this.$data.unlock_code = '';
				var self = this;
				setTimeout(function() { self.$data.error = ''; }, 5000);
			}
		}
	}
}
</script>

<style>
.fade-enter-active, .fade-leave-active {
	transition: opacity .5s
}
.fade-enter, .fade-leave-to {
	opacity: 0
}
</style>