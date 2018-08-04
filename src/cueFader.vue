<template>
    <div class="fader-box" :data-cue="cue">
        <div class="info-box-content">
            <span class="info-box-icon" :class="color"><i class="fa" :class="icon"></i></span>
            <span class="info-box-text">{{type}}</span>
            <span class="info-box-number">{{name}}</span>
        </div>
        <input type="range" orient="vertical" min="0" :max="cue.length - 1" value="0" @change="changeCue" ref="fader" v-model="currentCueIndex" />
    </div>
</template>


<script>
    import {bus} from './bus';
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
                'fading' : false,
                currentCueIndex : 0
            }
        },
        created(){
            let that = this;
          bus.$on('activeCuelistsChanged',function(){
              that.updatedActiveCues();
          });
        },
        methods: {
            changeCue: function(){
                let cue_index = this.currentCueIndex;
                let cue = this.$props.cue[cue_index];
                let that = this;
                if(cue instanceof Array){
                    cue.forEach(function(each){
                        that.setCue(each);
                    });
                } else {
                    that.setCue(cue);
                }
            },
            updatedActiveCues: function(){
                let that = this;
                this.$root.activeCuelists.forEach(function(each) {
                    that.$props.cue.forEach(function(cue,cue_index){
                        if(cue instanceof Array){
                            if(cue.includes(each.id)){
                                that.currentcueIndex = cue_index;
                            }
                        } else if(cue === each.id){
                            that.currentcueIndex = cue_index;
                        }
                    });
                });
            },
            setCue: function(cue){
                this.$root.sendCommand('cuelistGo ' + cue);
            },
        },
    }
</script>