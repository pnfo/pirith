<template>
  <v-sheet class="text-center bottom-sheet" >
      <v-card id="text" v-if="curText.length && showText">
        <v-simple-table dense style="table-layout: fixed">
          <tbody class="text-rows">
            <tr v-for="(row, ri) in curTextSubset" :key="ri" :class="['text-row', { present: row.oi == curTextIndex } ]">
              <td class="part pali px-2">{{ row.pali }}</td>
              <td class="part sinh px-2 info--text" v-if="row.sinh" :rowspan="row.span">{{ row.sinh }}</td>
            </tr>
          </tbody>
        </v-simple-table>

        <v-btn absolute dark fab small bottom right color="primary" @click="showText = false">
          <v-icon>mdi-eye-off</v-icon>
        </v-btn>
        <v-btn fab small depressed absolute bottom left color="info" v-if="curRepeats > 1">
          <v-icon>mdi-repeat</v-icon>
        </v-btn>
      </v-card>
      
      <v-btn v-if="!showText" absolute dark fab small top right color="primary" @click="showText = true">
          <v-icon>mdi-eye</v-icon>
      </v-btn>
      <v-progress-linear :value="curCount/curRepeats * 100" height="25" color="primary" v-if="curRepeats > 1">
        {{ curCount + '/' + curRepeats }}
      </v-progress-linear>
      <audio ref="audio" controls style="width: 100%" :src="playingSrc"></audio>
    </v-sheet>
</template>

<style scoped>
.text-row .pali { font-size: 1.1rem; word-break: break-word; text-align: right; }
.text-row .sinh { font-size: 1.1rem; text-align: left; }
.text-row .part { width: 50% }

.theme--light .present .pali { background-color: blanchedalmond;  }
.theme--dark .present .pali { background-color: #54473c;  }

.bottom-sheet { position: fixed; bottom: 0; width: 100%; max-width: 800px; left: 50%; transform: translateX(-50%);}
</style>

<script>
  import { pirithList, setupMediaSession } from '@/pirith-list.js'
  import { pirithData } from '@/pirith-data.js'
  import { mapState, mapGetters } from 'vuex'

  export default {
    name: 'AudioTextControl',
    props: { },
    data: function() {
      return {
        pirithList,
        showText: true,
        curText: [],
        elapsedRatio: 0, // in the current text

        isCounting: false, // unpaused continuous play (proper play)
        curCount: 0, // num of times the current pirith was played
      }
    },
    computed: {
      ...mapGetters(['curPl']),
      curPirith: {
        get () { return this.$store.state.curPirith  },
        set (value) { this.$store.commit('setCurPirith', value) }
      },
      curTextIndex() {
        const total = this.curText.reduce((acc, row) => acc + row.pali.length, 0);
        const elapsedTotal = total * this.elapsedRatio;
        for (let i = 0, sum = 0; i < this.curText.length; i++) {
            sum = sum + this.curText[i].pali.length;
            if (sum >= elapsedTotal) return i;
        }
        return this.curText.length - 1;
      },
      curTextSubset() { // returns max 10 text rows
        let startInd = 0, endInd = this.curText.length
        if (this.curText.length > 10) {
          startInd = Math.max(0, this.curTextIndex - 5) // 6 is the max rowspan, so -5
          endInd = Math.min(this.curText.length, this.curTextIndex + 4)
        }
        return this.curText.slice(startInd, endInd).map((row, i) => { return {...row, oi: startInd + i} })
      },
      playingInfo() { return this.curPirith ? this.pirithList[this.curPirith - 1] : [] },
      playingSrc() { return this.playingInfo[0] ? `audio/${this.playingInfo[0]}.mp3` : '' },
      lInd() { return this.curPl.list.findIndex(e => e.pInd == (this.curPirith - 1)) },
      curRepeats() { return this.lInd < 0 ? 0 : this.curPl.list[this.lInd].repeats },
    },

    watch: {
      curPirith() {
        this.curCount = 0
        this.updatePirith()
      },
    },
    
    methods: {
      incrementMetrics(pInd) {
        this.$store.commit('incrementMetrics', pInd)
        this.curCount++
      },
      textRowClass: function(ind) { 
        if (this.curTextIndex < ind) return 'past'
        if (this.curTextIndex == ind) return 'present'
        return 'future'
      },

      updatePirith: function() { // update display
        this.curText = []
        document.getElementById('title-bar-text').innerText = this.playingInfo[2] || 'සෙත් පිරිත්'
        if (!this.curPirith) return

        this.$nextTick(function() {
          //this.$refs.audio.src = `audio/${this.playingInfo[0]}.mp3`;
          const pInd = this.curPirith - 1 // for passing to then function
          this.$refs.audio.play().then(function() { setupMediaSession(pInd) });
          this.isCounting = true
          console.log(`${this.playingInfo[0]} playing.`)
        })
      },
      getNextPirithToPlay: function() {
        // if not repeats are defined then go to next pirith even if not a proper play
        if (this.curRepeats > 1 && this.curCount < this.curRepeats) return this.curPirith // repeat
        // go to next pirith in the list
        if (this.lInd + 1 >= this.curPl.list.length) return 0 // playlist finished - nothing to play
        this.curCount = 0
        return this.pirithList[this.curPl.list[this.lInd + 1].pInd][1] + 1
      },
      // event handler
      pirithPaused: function() { // pause and seeking (ending also fires this - so comapre currentTime to duration)
        console.log('pirith paused')
        if (Math.abs(this.$refs.audio.currentTime - this.$refs.audio.duration) > 0.01) {
          this.isCounting = false // do not count this
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
          //console.log(currentTime)
      },
    },

    mounted() {
      document.addEventListener('pause', this.pirithPaused, true)
      document.addEventListener('ended', this.pirithEnded, true)
      document.addEventListener('timeupdate', this.timeUpdated, true)
    }
  }
</script>
