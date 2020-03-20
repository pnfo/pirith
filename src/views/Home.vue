<template>
  <div class="home">
    <playlist-editor></playlist-editor>

    <v-list :dense="true">
      <draggable v-model="curPlList" handle=".drag-handle" @end="dragEnded">

      <v-list-item v-for="({pInd, repeats}, lInd) in curPlList" :key="pInd" class="d-flex"
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
              <v-btn icon :color="repeats > 1 ? 'accent' : ''" v-on="on">
                <v-icon>mdi-repeat</v-icon>
              </v-btn>
            </template>

            <v-list><v-list-item><v-radio-group :value="repeats" @change="nr => changeRepeats({lInd, nr})" column>
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
                @click="isInPlaylist(plInd, pInd) ? deleteFromPlaylist({plInd, lInd}) : addToPlaylist({plInd, pInd})">
                <v-list-item-title>{{ name }}</v-list-item-title>
                <v-list-item-icon><v-icon v-if="isInPlaylist(plInd, pInd)" color="success">mdi-check</v-icon></v-list-item-icon>
              </v-list-item>
            </v-list>
          </v-menu>
          
          <v-btn v-else icon @click="deleteFromPlaylist({plInd: curPlInd, lInd})" color="error">
            <v-icon>mdi-delete</v-icon>
          </v-btn>

          <v-btn class="drag-handle" icon>
            <v-icon>mdi-drag-horizontal-variant</v-icon>
          </v-btn>
        </div>

      </v-list-item>
      </draggable>
    </v-list>
    
    <AudioTextControl v-show="curPirith"></AudioTextControl>
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
import { mapState, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'Home',
  components: {
    PlaylistEditor, draggable, AudioTextControl,
  },
  data: function() {
      return {
        pirithList,
      }
  },
  
  computed: {
    ...mapState(['curPirith', 'curPlInd', 'playlists']),
    ...mapGetters(['curPl']),
    curPlList: { // use this in draggable without directly mutating the state
      get() { return this.curPl.list },
      set(newList) { this.$store.commit('reorderPl', newList) },
    }
  },

  methods: {
    ...mapMutations(['addToPlaylist', 'deleteFromPlaylist', 'changeRepeats']),
    dragEnded(e) { // swap repeats
      console.log(`dragged from ${e.oldIndex} to ${e.newIndex}`)
    },
    isInPlaylist(plInd, pInd) {
      return this.playlists[plInd].list.findIndex(e => e.pInd == pInd) != -1
    },

    playPausePirith: function(key) { // by user action
      this.$store.commit('setCurPirith', this.curPirith == key ? 0 : key)
    },
  },

  mounted: function() {}, // optional initialization
  
  watch: { 
    // save the playlist changes to storage - ideally should be in the store
    // However in store would have to duplicate the code multiple times
    playlists: {
      deep: true,
      handler() { localStorage.setItem('playlists', JSON.stringify(this.playlists)) } 
    },
  },
}
</script>
