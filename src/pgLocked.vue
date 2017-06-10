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
  <div class="lockscreen-logo">
    Auditorium Lighting
  </div>

  	<div class="text-center" style="margin-bottom: 24px;">
		Wall controls are locked out. Please enter the password to unlock
	</div>
  <!-- START LOCK SCREEN ITEM -->
  <div class="lockscreen-item">
 
    <!-- lockscreen credentials (contains the form) -->
    <form class="lockscreen-credentials">
      <div class="input-group">
        <input type="password" class="form-control" placeholder="password">

        <div class="input-group-btn">
          <button type="button" class="btn"><i class="fa fa-arrow-right text-muted"></i></button>
        </div>
      </div>
    </form>
    <!-- /.lockscreen credentials -->

  </div>
  <!-- /.lockscreen-item -->

</div>
</template>