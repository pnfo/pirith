<template>
  <v-app>
    <v-app-bar color="primary" dense dark app hide-on-scroll>
      
      <v-menu offset-y transition="slide-y-transition">
        <template v-slot:activator="{ on }">
          <v-btn icon color="primary--text" v-on="on">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
        </template>
        <v-list nav dense>
          <v-list-item v-for="(info, ind) in menuLinks" link :href="info[0]" :key="ind">
            <v-list-item-icon><v-icon color="accent">{{ 'mdi-' + info[1] }}</v-icon></v-list-item-icon>
            <v-list-item-content>{{ info[2] }}</v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
        
      <v-spacer></v-spacer>
      <v-toolbar-title id="title-bar-text">{{ isSettings ? 'සැකසුම්' : 'සෙත් පිරිත්' }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="isSettings" icon to="/">
        <v-icon>mdi-home</v-icon>
      </v-btn>
      <v-btn v-else icon to="/settings">
        <v-icon>mdi-cog</v-icon>
      </v-btn>
      
    </v-app-bar>

    <v-content>
      <router-view></router-view>
      <v-sheet class="text-center ma-2" id="content-about">
        මේ‍ ව්‍යායාමය නාඋයනේ අරියධම්ම හිමියන්ගේ ශ්‍රී නාමයට කෙරෙන උපහාරයක්ම වේවා. පාලි පෙළ සහ සිංහල පරිවර්තනය උපුටා ගැනීම පිරුවානා පොත් වහන්සේගෙනි. 
        උපකාර කල සියලුදෙනාට ද පින් අයත් වේවා. යම් දෝෂයක් ගැන අපව දැනුවත් කිරීමට pathnirvana<v-icon>mdi-at</v-icon>gmail.com.<br>
        මේ පිරිත් ඇතුලත් කර සැකසු අන්තර්ජාලය අනවශ්‍ය offline මෘදුකාංග <v-icon>mdi-laptop</v-icon> <a href="https://tipitaka.lk/library/459">පරිඝනක සඳහා</a> ලබාගන්න.<br>
        ෴෴
      </v-sheet>
    </v-content>
  </v-app>
</template>

<script>
const menuLinks = [
  ['https://pitaka.lk/main', 'book', 'සරල ත්‍රිපිටකය'],
  ['https://pitaka.lk/dict', 'book-outline', 'පාළි-සිංහල ශබ්දකෝෂය'],
  ['https://tipitaka.lk/', 'book-open', 'බුද්ධ ජයන්ති ත්‍රිපිටකය'],
  ['https://pitaka.lk/books', 'book-open-variant', 'බෞද්ධ පොත් සංචිතය'],
  ['https://pitaka.lk/dhammapada', 'image-album', 'ධම්මපද කතා වස්තු'],
  ['https://www.facebook.com/pitaka.lk', 'face', 'Facebook පිටුව'],
]

export default {
  name: 'App',

  data: () => ({
    menuLinks,
  }),
  
  computed: {
    isSettings() { return this.$route.path == '/settings' },
  },
};
</script>
<style scoped>
@font-face { src: local('###'), url('./assets/fonts/UN-Abhaya.ttf') format('truetype'); font-weight: normal; font-family: 'sinhala'; }
/*@font-face { src: local('###'), url('./assets/fonts/AbhayaLibre-SemiBold.ttf') format('truetype'); font-weight: bold; font-family: 'sinhala'; }*/
@font-face { src: local('###'), url('./assets/fonts/UN-Alakamanda-4-95.ttf') format('truetype'); font-weight: normal; font-family: 'styled'; }

#app {
  font-family: 'sinhala'
}
#title-bar-text { font-family: 'styled'; font-size: 1.8rem; }
#content-about { font-size: 0.9rem; }

</style>