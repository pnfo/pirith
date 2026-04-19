import { defineStore } from 'pinia'
import { pirithList } from '@/pirith-list.js'

const initialPlaylists = [
  { name: 'සියලු‍ පිරිත්', list: [] },
  { name: 'තුන් සූත්‍රය', list: [{ pInd: 6, repeats: 1 }, { pInd: 7, repeats: 1 }, { pInd: 8, repeats: 1 }] },
  { name: 'ගැබිණි මවුවරුන් සඳහා', list: [{ pInd: 31, repeats: 7 }, { pInd: 39, repeats: 1 }] },
]

function updateAndroidStatusBar(isDark) {
  if (window.Android && typeof window.Android.setStatusBarColor === 'function') {
    const color = isDark ? '#292524' : '#2e4c37'; // dark: surface-dark-alt, light: primary
    window.Android.setStatusBarColor(color);
  }
}

function initFromStorage() {
  // load from storage if available
  const curPirith = parseInt(localStorage.getItem('curPirith') || 0) // pInd + 1 of the currently playing
  const curPlInd = parseInt(localStorage.getItem('curPlInd') || 0)
  const playMetrics = JSON.parse(localStorage.getItem('playMetrics')) || []
  const repeatCounts = JSON.parse(localStorage.getItem('repeatCounts')) || [1, 3, 7, 21, 108]
  const darkMode = localStorage.getItem('darkMode') === 'true'

  // playlist format was changed - hence clean and recreate playlist if storage version is not 2
  let playlists = JSON.parse(localStorage.getItem('playlists'))
  const version = parseInt(localStorage.getItem('pirith-version') || 0)
  if (version != 3 || !playlists) {
    playlists = initialPlaylists
    localStorage.removeItem('playlists') // incase the old item remains and it was not overwritten
  }
  localStorage.setItem('pirith-version', '3')

  // initialize the 'all' playlist to be the pirithList
  pirithList.forEach((info, pInd) => { // check if need to add more
    if (playlists[0].list.findIndex(e => e.pInd == pInd) < 0) { // new pirith
      playlists[0].list.push({pInd, repeats: 1}) // add to 'all' playlist
      if (!playMetrics[pInd]) playMetrics[pInd] = 0 // metrics kept in sync with 'all' playlist
    }
  });
  
  // Apply dark mode immediately
  if (darkMode) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  updateAndroidStatusBar(darkMode)

  // Active dropdown state (transient, not saved to storage)
  const activeDropdown = null

  return { curPirith, curPlInd, playlists, playMetrics, repeatCounts, darkMode, activeDropdown }
}

export const usePlayerStore = defineStore('player', {
  state: () => initFromStorage(),
  
  getters: {
    curPl: (state) => state.playlists[state.curPlInd],
  },

  actions: {
    setActiveDropdown(name) {
      this.activeDropdown = name
    },
    setCurPirith(ind) {
      this.curPirith = ind
      localStorage.setItem('curPirith', ind.toString())
    },
    setPlInd(ind) {
      this.curPlInd = ind
      localStorage.setItem('curPlInd', ind.toString())
    },
    incrementMetrics(pInd) {
      this.playMetrics[pInd] = (this.playMetrics[pInd] || 0) + 1
      localStorage.setItem('playMetrics', JSON.stringify(this.playMetrics))
    },
    setRepeatCounts(counts) {
      this.repeatCounts = counts
      localStorage.setItem('repeatCounts', JSON.stringify(counts))
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode
      localStorage.setItem('darkMode', this.darkMode)
      if (this.darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      updateAndroidStatusBar(this.darkMode)
    },

    addToPlaylist({ plInd, pInd }) {
      this.playlists[plInd].list.push({ pInd, repeats: 1 })
      this.savePlaylists()
    },
    deleteFromPlaylist({ plInd, lInd }) {
      this.playlists[plInd].list.splice(lInd, 1)
      this.savePlaylists()
    },

    setPlaylistName(newName) {
      this.playlists[this.curPlInd].name = newName
      this.savePlaylists()
    },

    addNewPlaylist() {
      let nextAvail = 1, names = this.playlists.map(p => p.name)
      while(names.indexOf(`වාදන ලැයිස්තුව ${nextAvail}`) != -1) nextAvail++
      this.playlists.push({ name: `වාදන ලැයිස්තුව ${nextAvail}`, list: [] })
      this.savePlaylists()
    },
    deletePlaylist() {
      this.playlists.splice(this.curPlInd, 1);
      this.savePlaylists()
    },
    reorderPl(newList) {
      this.playlists[this.curPlInd].list = newList
      this.savePlaylists()
    },
    changeRepeats({lInd, nr}) {
      this.playlists[this.curPlInd].list[lInd].repeats = nr
      this.savePlaylists()
    },
    savePlaylists() {
      localStorage.setItem('playlists', JSON.stringify(this.playlists))
    }
  }
})
