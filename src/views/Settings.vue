<template>
  <v-container>
    <v-row dense>

      <v-col cols="12">
        <v-card>
          <v-card-title v-if="!$vuetify.theme.dark">රාත්‍රී අඳුරු තිරය</v-card-title>
          <v-card-title v-else>දහවල් ආලෝකමත් තිරය</v-card-title>
          <v-card-subtitle>රාත්‍රී අඳුරු තිරය සහ දහවල් ආලෝකමත් තිරය අතර මාරු වෙන්න. අඳුරු තිරය රාත්‍රියේදී ඇසට පහසුය.</v-card-subtitle>
          <v-card-actions>
            <v-btn @click="$vuetify.theme.dark = !$vuetify.theme.dark" small fab color="primary">
              <v-icon>{{ 'mdi-brightness-' + ($vuetify.theme.dark ? '4' : '7') }}</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12">
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

      <v-col cols="12">
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

      <v-col cols="12">
        <v-card>
          <v-card-title>
            මෙම මෘදුකාංග වෙබ් අඩවිය භාවිතා කිරීමේ උපදෙස්
          </v-card-title>
          <v-card-text>
            <iframe width="100%" src="https://www.youtube.com/embed/XFpYqlgT-a0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            <div>පහත බොත්තම එබීමෙන්ද පිවිසිය හැක</div>
          </v-card-text>
          <v-card-actions>
            <v-btn href="https://youtu.be/XFpYqlgT-a0">
              Youtube
              <v-icon right dark color="error">mdi-youtube</v-icon>
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
