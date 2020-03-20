<template>
  <v-container class="pb-0">
    <div class="d-flex justify-center">
      <v-icon color="info">mdi-playlist-music</v-icon>

      <template v-if="isEdit">
        <v-text-field dense placeholder="ලැයිස්තු නම" class="flex-grow-1 mx-4" counter="25" 
            v-model="editedName" :rules="rules" style="max-width: 300px"
            append-icon="mdi-check" @click:append="commitEditName">
        </v-text-field>

        <v-btn icon @click="isEdit = false">
          <v-icon>mdi-cancel</v-icon>
        </v-btn>
      </template>

      <template v-else>
        <v-select dense :items="playlists.map((p,i)=>({text: p.name, value: i}))" style="max-width: 300px" class="mx-4"
            v-model="curPlInd">
        </v-select>

        <v-btn icon dense @click="startEditName">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>

      <v-btn v-if="playlists[curPlInd].list.length == 0" icon @click="deletePlaylist" color="error">
        <v-icon>mdi-delete-sweep</v-icon>
      </v-btn>
      <v-btn v-else icon @click="addNewPlaylist" color="success">
        <v-icon>mdi-folder-plus-outline</v-icon>
      </v-btn>
    </div>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'PlaylistEditor',
  props: {  },
  data: function() {
    return {
      isEdit: false,
      editedName: '',
      rules: [
        v => !!v || 'වාදන ලැයිස්තු නමක් අවශ්‍යයි',
        v => v.length >= 5 || 'වාදන ලැයිස්තු නමේ අවම දිග අකුරු 5',
        v => v.length <= 25 || 'වාදන ලැයිස්තු නමේ උපරිම දිග අකුරු 25',
        v => this.curPlNames.indexOf(v) == -1 || 'මේ‍ නමින් ලැයිස්තුවක් දැනටම ඇත',
      ],
    }
  },
  computed: {
    ...mapState(['playlists']),
    curPlInd: {
      get () { return this.$store.state.curPlInd  },
      set (value) { this.$store.commit('setPlInd', value) }
    },
    curPlNames() { return this.playlists.map(p => p.name) },
  },
  
  methods: {
    startEditName() {
      this.isEdit = true
      this.editedName = this.playlists[this.curPlInd].name
    },
    commitEditName() {
      if (this.rules.some(rule => rule(this.editedName) !== true)) return // some rule failed
      this.isEdit = false
      this.$store.commit('setPlaylistName', this.editedName)
    },

    addNewPlaylist() {
      this.isEdit = false // we could be in edit mode so disable it
      this.$store.commit('addNewPlaylist')
      this.$store.commit('setPlInd', this.playlists.length - 1)
    },
    deletePlaylist() {
      this.isEdit = false
      this.$store.commit('deletePlaylist')
      this.$store.commit('setPlInd', 0)
    },

  },
}
</script>
