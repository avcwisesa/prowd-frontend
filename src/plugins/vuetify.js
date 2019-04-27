import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
  iconfont: 'md',
  theme: {
    wikiRed: '#990000',
    wikiBlue: '#006699',
    wikiGreen: '#339966',
    wikiBlack: '#484848',
    primary: '#7986CB',
    secondary: '#CFD8DC',
    accent: '#9c27b0',
    error: '#f44336',
    warning: '#f2671d',
    info: '#2196f3',
    success: '#4caf50'
  }
})
