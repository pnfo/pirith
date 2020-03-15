<template>
  <div class="home">
    <v-list :dense="true">
      <v-list-item v-for="(pInd, lInd) in curPl.list" :key="pInd" class="d-flex"
        :selected="curPirith == pInd + 1">

        <div class="d-flex align-center flex-grow-1" @click="playPausePirith(pInd + 1)" style="min-width: 0;">
          <span class="pirith-number pr-1">{{ pInd + 1 }}</span>
          <span class="pirith-name pr-1 flex-grow-1">{{ pirithList[pInd][2] }}</span>
          <span class="pirith-duration pr-1 d-none d-sm-flex text--secondary" v-if="curPirith != pInd + 1">
            {{ '(' + pirithList[pInd][4] + ')' }}
          </span>
          <span class="pirith-repeat-count" v-if="curPl.repeats[lInd] > 1 && curPirith == pInd + 1">
            <span v-if="curPirith == pInd + 1">{{ curCount + '/' }}</span>{{ curPl.repeats[lInd] }}
          </span>
        </div>
        
        <div class="d-flex align-center">
          <v-menu left offset-x>
            <template v-slot:activator="{ on }">
              <v-btn icon :color="curPl.repeats[lInd] > 1 ? 'accent' : ''" v-on="on">
                <v-icon>mdi-repeat</v-icon>
              </v-btn>
            </template>

            <v-list><v-list-item><v-radio-group v-model="curPl.repeats[lInd]" column>
              <v-radio v-for="n in [1, 3, 7, 21, 108]" :key="n" :label="n.toString()" :value="n"></v-radio>
            </v-radio-group></v-list-item></v-list>
          </v-menu>

          <v-btn icon disabled>
            <v-icon v-if="curPlInd == 0">mdi-playlist-plus</v-icon>
            <v-icon v-if="curPlInd != 0">mdi-delete</v-icon>
          </v-btn>

          <v-btn icon disabled>
            <v-icon>mdi-swap-vertical</v-icon>
          </v-btn>
        </div>

      </v-list-item>
    </v-list>
    
    <v-sheet class="text-center bottom-sheet" v-if="curPirith">
      <v-card id="text" v-if="curText.length && showText">
        <v-simple-table dense>
          <tbody class="text-rows">
            <tr :class="['text-row', textRowClass(ri)]" v-for="(row, ri) in curText" :key="ri">
              <td class="part pali">{{ row[0] }}</td>
              <td class="part sinh info--text">{{ row[1] }}</td>
            </tr>
          </tbody>
        </v-simple-table>

        <v-btn absolute dark fab small bottom right color="primary" @click="showText = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card>

      <v-btn v-if="!showText" absolute dark fab small top right color="primary" @click="showText = true">
          <v-icon>mdi-format-color-text</v-icon>
      </v-btn>
      <audio ref="audio" controls style="width: 100%"></audio>
    </v-sheet>

  </div>
</template>

<style scoped>
.pirith-number::after { content: "."; }
.pirith-name { font-size: 1.2rem; cursor: pointer; white-space: nowrap; overflow: hidden;  }
.pirith-duration { font-size: 0.8rem; }
.pirith-repeat-count { font-size: 1rem; }

.text-row .pali { font-size: 1.1rem; word-break: break-word; text-align: right; }
.text-row .sinh { font-size: 1.1rem; text-align: left; }
.text-row .part { min-width: 100px; }

.theme--light .text-row.present { background-color: blanchedalmond;  }
.theme--dark .text-row.present { background-color: #54473c;  }

.theme--light .v-list-item[selected] { background-color: rgb(228, 214, 183); }
.theme--dark .v-list-item[selected] { background-color: #44372c;; }

.bottom-sheet { position: fixed; bottom: 0; width: 100%; max-width: 800px; left: 50%; transform: translateX(-50%);}
</style>

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
        fab: false,
        pirithList,
        curPlInd: 0,
        playlists: [
          { name: 'all', list: [] }
        ],
        playMetrics: [],
        curPirith: 0, // pInd + 1 of the currently playing
        showText: true,
        curText: [],
        elapsedRatio: 0,

        isCounting: false, // unpaused continuous play (proper play)
        curCount: 0, // num of times the current pirith was played
      }
  },
  
  computed: {
    playingInfo: function() { return this.curPirith ? this.pirithList[this.curPirith - 1] : [] },
    playingSrc: function() { return this.playingInfo[0] ? `audio/${this.playingInfo[0]}.mp3` : '' },
    curTextIndex: function() {
        const total = this.curText.reduce((acc, row) => acc + row[0].length, 0);
        const elapsedTotal = total * this.elapsedRatio;
        for (let i = 0, sum = 0; i < this.curText.length; i++) {
            sum = sum + this.curText[i][0].length;
            if (sum >= elapsedTotal) return i;
        }
        return this.curText.length - 1;
    },
    curPl: function() { return this.playlists[this.curPlInd] },
  },

  watch: { // save the watched data to storage
    curPlInd() { localStorage.setItem('curPlInd', this.curPlInd.toString()) },
    playlists: { 
      deep: true,
      handler() { localStorage.setItem('playlists', JSON.stringify(this.playlists)) } 
    },
    playMetrics() { localStorage.setItem('playMetrics', JSON.stringify(this.playMetrics)) },
  },

  methods: {
    audio: function() { return document.getElementById('audio') },
    incrementMetrics(pInd) { 
      this.$set(this.playMetrics, pInd, this.playMetrics[pInd] + 1) 
      this.curCount++
    },
    textRowClass: function(ind) { 
      if (this.curTextIndex < ind) return 'past'
      if (this.curTextIndex == ind) return 'present'
      return 'future'
    },
    playPausePirith: async function(key) { // by user action
      this.curPirith = this.curPirith == key ? 0 : key
      this.curCount = 0
      this.updatePirith()
    },
    updatePirith: function() { // update display
      this.curText = []
      document.getElementById('title-bar-text').innerText = this.playingInfo[2] || 'සෙත් පිරිත්'
      if (!this.curPirith) return

      this.$nextTick(function() {
        this.$refs.audio.src = `audio/${this.playingInfo[0]}.mp3`;
        const pInd = this.curPirith - 1 // for passing to then function
        this.$refs.audio.play().then(function() { setupMediaSession(pInd) });
        this.isCounting = true
        console.log(`${this.playingInfo[0]} playing.`)
      })
    },
    getNextPirithToPlay: function() {
      const lInd = this.curPl.list.indexOf(this.curPirith - 1)
      // if not repeats are defined then go to next pirith even if not a proper play
      if (this.curPl.repeats[lInd] > 1 && this.curCount < this.curPl.repeats[lInd]) return this.curPirith // repeat
      // go to next pirith in the list
      if (lInd + 1 >= this.curPl.list.length) return 0 // playlist finished - nothing to play
      this.curCount = 0
      return pirithList[this.curPl.list[lInd + 1]][1] + 1
    },
    // event handler
    pirithPaused: function() { // pause and seeking (ending also fires this - so comapre currentTime to duration)
      console.log('pirith paused')
      if (Math.abs(this.$refs.audio.currentTime - this.$refs.audio.duration) > 0.01) {
        //this.isCounting = false // do not count this
      }
    },
    pirithEnded: function() {
      if (this.isCounting) {
        this.incrementMetrics(this.curPirith - 1)
        this.isCounting = false
      }
      this.curPirith = this.getNextPirithToPlay()
      this.updatePirith()
    },
    timeUpdated: function() {
        if (!this.curPirith || !pirithData[this.playingInfo[0]] || !this.$refs.audio) return;
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
    // load from storage if available
    this.curPlInd = parseInt(localStorage.getItem('curPlInd') || 0)
    this.playlists = JSON.parse(localStorage.getItem('playlists'))
    this.playMetrics = JSON.parse(localStorage.getItem('playMetrics'))

    // initialize the 'all' playlist to be the pirithList
    if (!this.playlists) this.playlists = [ { name: 'all', list: [], repeats: [] } ]
    if (!this.playMetrics) this.playMetrics = []

    pirithList.forEach(info => { // check if need to add more
      if (this.playlists[0].list.indexOf(info[1]) < 0) { // new pirith
        this.playlists[0].list.push(info[1]) // add to 'all' playlist
        this.playlists[0].repeats.push(1)
        this.playMetrics.push(0) // metrics kept in sync with 'all' playlist
      }
    });
    //this.playlists[0].list = [...pirithList.keys()]
    // load custom playlists and playcounts from local storage
    //this.playMetrics = this.playlists[0].list.map(_ => 0) // init to 0
    
    document.addEventListener('pause', this.pirithPaused, true)
    document.addEventListener('ended', this.pirithEnded, true)
    document.addEventListener('timeupdate', this.timeUpdated, true)
  },
}
</script>
