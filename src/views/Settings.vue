<template>
  <v-container fluid>
    <v-row dense>

      <v-col cols="12" sm="6">
        <v-card>
          <v-card-title v-if="!$vuetify.theme.dark">රාත්‍රී අඳුරු තිරය</v-card-title>
          <v-card-title v-else>දහවල් ආලෝකමත් තිරය</v-card-title>
          <v-card-subtitle>රාත්‍රී අඳුරු තිරය සහ දහවල් ආලෝකමත් තිරය අතර මාරු වෙන්න. අඳුරු තිරය රාත්‍රියේදී ඇසට පහසුය.</v-card-subtitle>
          <v-card-actions>
            <v-btn @click="$vuetify.theme.dark = !$vuetify.theme.dark"  outlined>
              <v-icon class="mr-2">{{ 'mdi-brightness-' + ($vuetify.theme.dark ? '4' : '7') }}</v-icon>
              {{ $vuetify.theme.dark ? 'ආලෝකමත් තිරය' : 'අඳුරු තිරය' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6">
        <v-card>
          <v-card-title>නැවත වාදනය කළ හැකි වාර ගණන්</v-card-title>
          <v-card-subtitle>එකම පිරිත නැවත නැවත වාදනය කළ හැකි වාර ගණන් පහතින් ඇතුළු කරන්න. ඒ ඒ ගණන හිස්තැනකින් (space) වෙන් කරන්න.</v-card-subtitle>
          <v-card-actions>
            <v-btn fab small depressed color="info">
              <v-icon>mdi-repeat</v-icon>
            </v-btn>
            <v-text-field dense placeholder="ලැයිස්තු නම" class="mx-4" counter="25" 
              v-model="repeatCountsText" :rules="rules" style="max-width: 300px">
            </v-text-field>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6">
        <v-card>
          <v-card-title>
            ඔබ විසින් පිරිත් අසන ලද වාර ගණන්
          </v-card-title>
          <v-card-text>
            <div>එක් එක් පිරිත ඔබ විසින් ඇසූ වාරගණන් පහතින් දිස්වනු ඇත. පිරිත මුල සිට අගට නොකඩවා අසන ලද වාරයන් පමණක් මෙහිදී ගණනය කරනු ලැබේ. 
              එක් වරක් හෝ ඔබ ඇසූ පිරිත් පමණක් මෙහි දක්වනු ලැබේ.</div>
            <v-simple-table dense style="table-layout: fixed">
              <thead>
                <tr>
                  <th class="text-left">පිරිතේ නම</th>
                  <th class="text-left">ඇසූ වාර</th>
                </tr>
              </thead>
              <tbody class="text-rows">
                <tr v-for="(metric, i) in metrics" :key="i">
                  <td class="px-2">{{ metric.name }}</td>
                  <td class="px-2 info--text">{{ metric.count }}</td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card-text>
        </v-card>
      </v-col>

       <v-col cols="12" sm="6">
        <v-card>
          <v-card-title>
            පිරිත් තමන්ටම කියන ආකාරය
          </v-card-title>
          <v-card-text>
            <div>මේ පිරිත් ස්වාමින්වහන්සේ විසින් සජ්ඣායනා කරන්නේ ඔබට සෙත් පිණිසය. 
              නමුත් පිරිත ඔබ විසින් ඔබටම සෙත් පිණිස සජ්ඣායනා කරගන්නා අවස්ථාවල පහත පරිදි සමහර වචන වෙනස් කර ගත යුතුය.
              බොහෝ අවස්ථාවල එසේ වෙනස් කළ යුතු පාලි වචන වරහන් තුළ දක්වා ඇත.</div>
            <v-simple-table dense style="table-layout: fixed">
              <thead>
                <tr>
                  <th class="text-left">වචනය</th>
                  <th class="text-left">වෙනස් කළ යුතු අයුරු</th>
                </tr>
              </thead>
              <tbody class="text-rows">
                <tr v-for="(c, i) in pronounChanges" :key="i">
                  <td class="px-2">{{ c[0] }}</td>
                  <td class="px-2">{{ c[1] }}</td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6">
        <v-card>
          <v-card-title>
            මෙම මෘදුකාංග වෙබ් අඩවිය භාවිතා කිරීමේ උපදෙස්
          </v-card-title>
          <v-card-subtitle>පහත බොත්තම එබීමෙන් උපදෙස් අඩංගු Youtube වීඩියෝ එකට පිවිසිය හැක</v-card-subtitle>
          <!--<v-card-text>
            <iframe width="100%" height="400px" src="https://www.youtube.com/embed/XFpYqlgT-a0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </v-card-text>-->
          <v-card-actions>
            <v-btn href="https://youtu.be/XFpYqlgT-a0" text outlined color="primary">
              <v-icon dark color="error" class="mr-2">mdi-youtube</v-icon>
              Youtube
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

    </v-row>

  </v-container>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
import { pirithList } from '@/pirith-list.js'
const rpcTextAr = t => t.split(' ').filter(x => x.length).map(x => parseInt(x))

export default {
  name: 'Settings',

  data: function() {
    return {
      rules: [
        v => v.search(/[^\d ]/) == -1 || 'අංක සහ හිස්තැන් (space) පමණක් යොදන්න',
        v => rpcTextAr(v).length >= 2 || 'අවම අංක දෙකක් වත් තිබිය යුතුය',
        v => rpcTextAr(v).length <= 5 || 'උපරිම අංක 5ක් එක් කරන්න',
        v => rpcTextAr(v)[0] == 1 || 'පළමු අංකය එක විය යුතුය',
        v => Math.max(...rpcTextAr(v)) <= 100000 || 'උපරිම අංකය ලක්ෂයක් (100000) විය යුතුය',
      ],
      pronounChanges: [
        ['තේ', 'මේ'],
        ['තව', 'මම'],
        ['ත්වං', 'මං'],
        ['තුය්හං', 'මය්හං'],
        ['පරික්ඛිතොසි', 'පරික්ඛිතොස්මි'], //in jinapanjara
        ['චරාසි', 'චරාමි'], //in jinapanjara
      ],
    }
  },
  
  computed: {
    ...mapState(['repeatCounts', 'playMetrics']),
    repeatCountsText: { 
      get() { return this.repeatCounts.join(' ') },
      set(text) {
        if (this.rules.some(rule => rule(text) !== true)) return // some rule failed
        this.$store.commit('setRepeatCounts', rpcTextAr(text)) 
      },
    },
    metrics() {
      return this.playMetrics.map((count, i) => ({ name: pirithList[i][2], count }))
        .filter(m => m.count)
        .sort((a, b) => b.count - a.count)
    },
  },
}
</script>
