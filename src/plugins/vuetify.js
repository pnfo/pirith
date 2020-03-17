import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
    icons: {
        iconfont: 'faSvg',
    },
    theme: {
        themes: {
            light: {
                primary: '#795548',
                secondary: '#ae8f73',
                accent: '#ff9800',
                error: '#f44336',
                warning: '#ffc107',
                info: '#2196f3',
                success: '#4caf50'
            },
            dark: {
                primary: '#795548',
                anchor: '#cab3b3',
            }
        },
        dark: false,
    },
});
