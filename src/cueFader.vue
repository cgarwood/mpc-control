<template>
    <div class="fader-box" :data-cue="cue">
        <div class="info-box-content">
            <span class="info-box-icon" :class="color"><i class="fa" :class="icon"></i></span>
            <span class="info-box-text">{{type}}</span>
            <span class="info-box-number">{{name}}</span>
        </div>
        <input type="range" orient="vertical" min="0" :max="cue.length" value="0" @change="changeCue" ref="fader" v-bind:value="currentCueIndex" />
    </div>
</template>


<script>
    module.exports = {
        props: {
            'cue' : {
                type: Array,
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
            changeCue: function(){
                let cue_index = currentCueIndex;
                console.log(cue_index);
            },
            toggleCue: function() {
                if (this.isActive()) {
                    this.$root.sendCommand('cuelistRelease ' + this.$props.cue);
                } else {
                    this.$root.sendCommand('cuelistGo ' + this.$props.cue);
                }
                this.$data.fading = true;
                var data = this.$data;
                setTimeout(function() { data.fading = false; }, 4000);
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