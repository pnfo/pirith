<template>
  <div class="home">
    <playlist-editor :playlists="playlists" :cur-pl-ind.sync="curPlInd"></playlist-editor>

    <v-list :dense="true">
      <draggable v-model="curPl.list" handle=".drag-handle" @end="dragEnded">

      <v-list-item v-for="(pInd, lInd) in curPl.list" :key="pInd" class="d-flex"
        :selected="curPirith == pInd + 1">

        <div class="d-flex align-center flex-grow-1" @click="playPausePirith(pInd + 1)" style="min-width: 0;">
          <span class="pirith-number pr-1">{{ pInd + 1 }}</span>
          <span class="pirith-name pr-1 flex-grow-1">{{ pirithList[pInd][2] }}</span>
          <span class="pirith-duration pr-1 d-none d-sm-flex text--secondary">
            {{ '(' + pirithList[pInd][4] + ')' }}
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

          <v-menu v-if="curPlInd == 0" offset-y :disabled="playlists.length == 0">
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on">
                <v-icon>mdi-playlist-plus</v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item v-for="[name, plInd] in playlists.map((p, i) => [p.name, i]).slice(1)" :key="plInd" 
                @click="isInPlaylist(plInd, pInd) ? deleteFromPlaylist(plInd, pInd) : addToPlaylist(plInd, pInd)">
                <v-list-item-title>{{ name }}</v-list-item-title>
                <v-list-item-icon><v-icon v-if="isInPlaylist(plInd, pInd)" color="success">mdi-check</v-icon></v-list-item-icon>
              </v-list-item>
            </v-list>
          </v-menu>
          
          <v-btn v-else icon @click="deleteFromPlaylist(curPlInd, pInd)" color="error">
            <v-icon>mdi-delete</v-icon>
          </v-btn>

          <v-btn class="drag-handle" icon>
            <v-icon>mdi-drag-horizontal-variant</v-icon>
          </v-btn>
        </div>

      </v-list-item>
      </draggable>
    </v-list>
    
    <AudioTextControl v-show="curPirith" :curPirith.sync="curPirith" :playMetrics="playMetrics" :curPl="curPl"></AudioTextControl>
  </div>
</template>

<style scoped>
.pirith-number::after { content: "."; }
.pirith-name { font-size: 1.2rem; cursor: pointer; white-space: nowrap; overflow: hidden;  }
.pirith-duration { font-size: 0.8rem; }
.pirith-repeat-count { font-size: 1rem; }

.theme--light .v-list-item[selected] { background-color: rgb(228, 214, 183); }
.theme--dark .v-list-item[selected] { background-color: #44372c;; }

.drag-handle { cursor: move; cursor: grab; cursor: -moz-grab; cursor: -webkit-grab; }
</style>

<script>
// @ is an alias to /src
import draggable from 'vuedraggable'
import PlaylistEditor from '@/components/PlaylistEditor.vue'
import AudioTextControl from '@/components/AudioTextControl.vue'
import { pirithList } from '@/pirith-list.js'

export default {
  name: 'Home',
  components: {
    PlaylistEditor, draggable, AudioTextControl,
  },
  data: function() {
      return {
        pirithList,
        curPlInd: 0,
        playlists: [
          { name: 'සියලු‍ පිරිත්', list: [] }
        ],
        playMetrics: [], // updated by AudioTextControl
        curPirith: 0, // pInd + 1 of the currently playing
      }
  },
  
  computed: {
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
    dragEnded(e) { // swap repeats
      console.log(`dragged from ${e.oldIndex} to ${e.newIndex}`)
      const or = this.curPl.repeats[e.oldIndex], nr = this.curPl.repeats[e.newIndex]
      this.$set(this.curPl.repeats, e.oldIndex, nr)
      this.$set(this.curPl.repeats, e.newIndex, or)
    },
    isInPlaylist(plInd, pInd) {
      return this.playlists[plInd].list.indexOf(pInd) != -1
    },
    addToPlaylist(plInd, pInd) {
      this.playlists[plInd].list.push(pInd)
      this.playlists[plInd].repeats.push(1)
    },
    deleteFromPlaylist(plInd, pInd) {
      const lInd = this.playlists[plInd].list.indexOf(pInd) // must not be -1
      this.playlists[plInd].list.splice(lInd, 1)
      this.playlists[plInd].repeats.splice(lInd, 1)
    },

    playPausePirith: async function(key) { // by user action
      this.curPirith = this.curPirith == key ? 0 : key
    },
  },

  mounted: function() { // initialization
    // load from storage if available
    this.curPlInd = parseInt(localStorage.getItem('curPlInd') || 0)
    this.playlists = JSON.parse(localStorage.getItem('playlists'))
    this.playMetrics = JSON.parse(localStorage.getItem('playMetrics'))

    // initialize the 'all' playlist to be the pirithList
    if (!this.playlists) this.playlists = [ { name: 'සියලු‍ පිරිත්', list: [], repeats: [] } ]
    if (!this.playMetrics) this.playMetrics = []

    pirithList.forEach(info => { // check if need to add more
      if (this.playlists[0].list.indexOf(info[1]) < 0) { // new pirith
        this.playlists[0].list.push(info[1]) // add to 'all' playlist
        this.playlists[0].repeats.push(1)
        this.playMetrics.push(0) // metrics kept in sync with 'all' playlist
      }
    });
  },
}
</script>
