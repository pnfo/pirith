<template>
  <div class="home">
    <v-list :dense="true">
      <v-list-item-group v-model="playingPirith">
        <v-list-item v-for="pInd in playlists[selectedPl].list" :key="pInd" :value="pInd + 1" color="info"
          @click="playPausePirith(pInd + 1)">
          
          <div  style="cursor: pointer">
            <v-icon>mdi-headphones</v-icon> 
            <span class="pirith-name">{{ pirithList[pInd][2] }}</span>
          </div>
          <v-spacer></v-spacer>

          <v-tooltip left open-delay="1000">
            <template v-slot:activator="{ on }">
              <v-btn icon color="accent" v-on="on">
                <v-icon>mdi-repeat</v-icon>
              </v-btn>
            </template>
            <span>Repeat</span>
          </v-tooltip>      

          <v-btn icon @click.stop="">
            <v-icon v-if="selectedPl == 0">mdi-playlist-plus</v-icon>
            <v-icon v-if="selectedPl != 0">mdi-delete</v-icon>
          </v-btn>

          <v-icon>mdi-chevron-up</v-icon>
          <v-icon>mdi-chevron-down</v-icon>
        </v-list-item>
      </v-list-item-group>
    </v-list>
    
    <div role="document" class="v-dialog__content v-dialog__content--active" style="top:auto;height:auto;bottom:0px;z-index:202;" tabindex="0" v-if="playingPirith">
      <transition name="bottom-sheet-transition">
        <div class="v-dialog v-dialog--active v-dialog--persistent v-bottom-sheet" style="margin-bottom:0;">
          <v-sheet class="text-center">
            <audio ref="audio" controls style="width: 100%"></audio>
            <v-btn class="mt-6" text color="red" @click="playingPirith = 0">close</v-btn>
            
            <div id="text" v-if="curText.length">
              <div class="text-rows past">
                <div class="text-row" v-for="(row, ri) in curText.slice(0, curTextIndex)" :key="ri">
                  <div class="pali part">{{ row[0] }}</div><div class="sinh part">{{ row[1] }}</div>
                </div>
              </div>
              <div class="text-rows present">
                <div class="text-row" v-for="(row, ri) in [curText[curTextIndex]]" :key="ri">
                  <div class="pali part">{{ row[0] }}</div><div class="sinh part">{{ row[1] }}</div>
                </div>
              </div>
              <div class="text-rows future">
                <div class="text-row" v-for="(row, ri) in curText.slice(curTextIndex + 1)" :key="ri">
                  <div class="pali part">{{ row[0] }}</div><div class="sinh part">{{ row[1] }}</div>
                </div>
              </div>
            </div>
          </v-sheet>
        </div>
      </transition>
    </div>

  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import { pirithList, setupMediaSession } from '@/pirith-list.js'
import { pirithData } from '@/pirith-data.js'

export default {
  name: 'Home',
  components: {
    HelloWorld
  },
  data: function() {
      return {
        pirithList,
        selectedPl: 0,
        playlists: [
          { name: 'all', list: [] }
        ],
        playingPirith: 0, // pInd + 1 of the currently playing
        showMenu: false,
        sheet: false,
        titleText: 'සෙත් පිරිත්',
        curText: [],
        elapsedRatio: 0,
      }
  },
  computed: {
    playingInfo: function() { return this.playingPirith ? this.pirithList[this.playingPirith - 1] : [] },
    playingSrc: function() { return this.playingInfo[0] ? `audio/${this.playingInfo[0]}.mp3` : '' },
    curTextIndex: function() {
        const total = this.curText.reduce((acc, row) => acc + row[0].length, 0);
        const elapsedTotal = total * this.elapsedRatio;
        for (let i = 0, sum = 0; i < this.curText.length; i++) {
            sum = sum + this.curText[i][0].length;
            if (sum >= elapsedTotal) return i;
        }
        return this.curText.length - 1;
    }
  },
  methods: {
    audio: function() { return document.getElementById('audio') },
    playPausePirith: async function(key) {
      this.playingPirith = this.playingPirith == key ? 0 : key
      
      if (this.playingPirith) {
        this.$nextTick(function() {this.playPirith()})
      }
      this.curText = []
      document.getElementById('title-bar-text').innerText = this.playingInfo[2] || 'සෙත් පිරිත්';
    },
    playPirith: function() {
      this.$refs.audio.src = `audio/${this.playingInfo[0]}.mp3`;
      const pInd = this.playingPirith - 1 // for passing to then function
      this.$refs.audio.play().then(function() { setupMediaSession(pInd) });
      console.log(`${this.playingInfo[0]} playing.`);
    },
    // event handler
    pirithPaused: function() {
      //this.playingPirith = 0
    },
    pirithEnded: function() {
      // if no repeat set to the next pirith
      //this.playingPirith 
    },
    timeUpdated: function() {
      //console.log('time updated')
        if (!this.playingPirith || !pirithData[this.playingInfo[0]] || !this.$refs.audio) return;
        const data = pirithData[this.playingInfo[0]], currentTime = this.$refs.audio.currentTime;
        let i = -1;
        for (; i+1 < data.labels.length && currentTime > data.labels[i+1][0]; i++);
        if (i < 0) return;

        const curLabel = data.labels[i]
        this.curText = data.text[i];
        this.elapsedRatio = Math.min(1, (currentTime - curLabel[0]) / (curLabel[1] - curLabel[0]) );
    },
  },
  mounted: function() { // initialization
    // load custom playlists and playcounts from local storage
    // initialize the 'all' playlist to be the pirithList
    this.playlists[0].list = [...pirithList.keys()]
    document.addEventListener('pause', this.pirithPaused, true)
    document.addEventListener('ended', this.pirithEnded, true)
    document.addEventListener('timeupdate', this.timeUpdated, true)
    //$('audio').on('ended', pirithEnded).on('pause', pirithPaused).on('timeupdate', timeUpdated);

    let that = this
    document.addEventListener('keydown', function (e) {
            if (e.key == 'Escape') that.showImage = ''
            else if (e.key == 'F12') { that.toggleShowImage('pali'); stopFurther(e); }
            else if (e.key == 'F11') { that.toggleShowImage('sinh'); stopFurther(e); }
            else if (e.key == 'PageUp') { that.gotoPrevPage(); window.scrollTo(0, document.body.scrollHeight); stopFurther(e); }
            else if (e.key == 'PageDown') { that.gotoNextPage(); window.scrollTo(0, 0); stopFurther(e); }
    });
  },
}
</script>
<style scoped>
/*.selected-pirith { border: 1px solid blue; }*/

.text-row .pali { font-size: 1.2rem; word-break: break-word; text-align: right; color: rgb(100, 100, 100); }
.text-row .sinh { color: brown;  font-size: 1.1rem; text-align: left; }
.text-row { display: flex; flex-flow: row; align-items: center; }
.text-row .part { width: 50%; padding: 0.1rem 0.5rem; }
.text-rows.present { background-color: blanchedalmond;  }
</style>
