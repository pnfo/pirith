import Vue from 'vue'
import Vuex from 'vuex'
import { pirithList } from '@/pirith-list.js'

Vue.use(Vuex)

const initialPlaylists = [
  { name: 'සියලු‍ පිරිත්', list: [] },
  { name: 'තුන් සූත්‍රය', list: [{ pInd: 6, repeats: 1 }, { pInd: 7, repeats: 1 }, { pInd: 8, repeats: 1 }] },
  { name: 'ගැබිණි මවුවරුන් සඳහා', list: [{ pInd: 31, repeats: 7 }, { pInd: 39, repeats: 1 }] },
]

function initFromStorage() {
  // load from storage if available
  const curPirith = parseInt(localStorage.getItem('curPirith') || 0) // pInd + 1 of the currently playing
  const curPlInd = parseInt(localStorage.getItem('curPlInd') || 0)
  const playMetrics = JSON.parse(localStorage.getItem('playMetrics')) || []

  // playlist format was changed - hence clean and recreate playlist if storage version is not 2
  let playlists = JSON.parse(localStorage.getItem('playlists'))
  const version = parseInt(localStorage.getItem('version') || 0)
  if (version != 3 || !playlists) playlists = initialPlaylists
  localStorage.setItem('version', '3')

  // initialize the 'all' playlist to be the pirithList
  pirithList.forEach((info, pInd) => { // check if need to add more
    if (playlists[0].list.findIndex(e => e.pInd == pInd) < 0) { // new pirith
      playlists[0].list.push({pInd, repeats: 1}) // add to 'all' playlist
      if (!playMetrics[pInd]) playMetrics[pInd] = 0 // metrics kept in sync with 'all' playlist
    }
  });
  return { curPirith, curPlInd, playlists, playMetrics }
}

export default new Vuex.Store({
  state: {
    ...initFromStorage(),
  },
  getters: {
    curPl: state => state.playlists[state.curPlInd],
  },

  mutations: {
    setCurPirith(state, ind) {
      state.curPirith = ind
      localStorage.setItem('curPirith', ind.toString())
    },
    setPlInd(state, ind) {
      state.curPlInd = ind
      localStorage.setItem('curPlInd', ind.toString())
    },
    incrementMetrics(state, pInd) {
      Vue.set(state.playMetrics, pInd, state.playMetrics[pInd] + 1) 
      localStorage.setItem('playMetrics', JSON.stringify(state.playMetrics))
    },

    addToPlaylist(state, { plInd, pInd }) {
      state.playlists[plInd].list.push({ pInd, repeats: 1 })
    },
    deleteFromPlaylist(state, { plInd, lInd }) {
      state.playlists[plInd].list.splice(lInd, 1)
    },

    setPlaylistName(state, newName) {
      state.playlists[state.curPlInd].name = newName
    },

    addNewPlaylist(state) {
      let nextAvail = 1, names = state.playlists.map(p => p.name)
      while(names.indexOf(`වාදන ලැයිස්තුව ${nextAvail}`) != -1) nextAvail++
      state.playlists.push({ name: `වාදන ලැයිස්තුව ${nextAvail}`, list: [] })
    },
    deletePlaylist(state) {
      state.playlists.splice(state.curPlInd, 1);
    },
    reorderPl(state, newList) {
      state.playlists[state.curPlInd].list = newList
    },
    changeRepeats(state, {lInd, nr}) {
      state.playlists[state.curPlInd].list[lInd].repeats = nr
    },
  },

  actions: {
  },
  modules: {
  }
})
