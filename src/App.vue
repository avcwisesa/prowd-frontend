<template>
  <v-app>
    <v-toolbar fixed :clipped-left="clipped">
      <v-btn outline color="teal darken-3" :to="{path:'/'}">
        <v-toolbar-title class="green--text">
          <span class="wikiRed--text"><strong>P</strong></span>
          <span class="wikiBlack--text"><strong>ro</strong></span>
          <span class="wikiGreen--text"><strong>W</strong></span>
          <span class="wikiBlue--text"><strong>D</strong></span>
        </v-toolbar-title>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn depressed color="teal darken-3"  class="white--text" :to="{path:'/profile/browse'}">
        Browse
        <v-icon right>apps</v-icon>
      </v-btn>
      <v-btn depressed color="teal darken-3" class="white--text" :to="{path:'/profile/new'}">
        Create
        <v-icon right>fiber_new</v-icon>
      </v-btn>
      <v-btn depressed color="teal darken-3" class="white--text" :to="{path:'/about'}">
        About
        <v-icon right>info</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <v-img v-if="jumbotron"
        :gradient="gradient"
        dark
        height="250px"
        src="https://images.pexels.com/photos/1500610/pexels-photo-1500610.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260"
      >
        <v-container fill-height>
          <v-layout align-center>
            <v-flex text-xs-center>
              <span class="display-4 font-weight-black wikiRed--text"><strong>P</strong></span>
              <span class="display-4 font-weight-black wikiBlack--text text--lighten-2"><strong>ro</strong></span>
              <span class="display-4 font-weight-black wikiGreen--text"><strong>W</strong></span>
              <span class="display-4 font-weight-black wikiBlue--text"><strong>D</strong></span>
              <div class="subheading my-4 white--text">{{ prowdPromo }}</div>
            </v-flex>
          </v-layout>
        </v-container>
      </v-img>
      <v-container fluid>
        <v-alert
          v-model="alertValue"
          color="success"
        >
          <a @click="dismissAlert()"><v-icon class="pr-2">cancel</v-icon></a>
          {{ alertMessage }}
        </v-alert>
        <router-view></router-view>
      </v-container>
    </v-content>
    <v-footer
      height="auto"
    >
      <v-card
        class="flex"
        flat
        tile
      >
        <v-card-actions class="teal darken-3 justify-center white--text">
          2019 — &nbsp;<strong>Free University of Bozen-Bolzano, Universitas Indonesia and Max-Planck Institute for Informatics</strong>
        </v-card-actions>
      </v-card>
    </v-footer>
  </v-app>
</template>

<script>
/* eslint-disable */
export default {
  beforeCreate () {
    this.alert = this.alertValue
    console.log(`alert value: ${this.alert}`)
  },
  data () {
    return {
      clipped: true,
      drawer: true,
      fixed: false,
      examples: [
        { icon: 'class', title: 'Single Profile', to: '/single' },
        { icon: 'class', title: 'Profile Comparison', to: '/compare' }
      ],
      menus: [
        { icon: 'home', title: 'Home', to: '/' },
        { icon: 'apps', title: 'Browse', to: '/profile/browse' },
        { icon: 'fiber_new', title: 'New Profile', to: '/profile/new' }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'ProWD',
      gradient: 'to top right, rgba(70,70,70, .9), rgba(70,70,70, .9)',
      prowdPromo: 'Class-Facet-Attribute Completeness Profiling System for Wikidata'
    }
  },
  computed: {
    alertValue () {
      return this.$store.state.alertValue
    },
    alertMessage () {
      return this.$store.state.alertMessage
    },
    jumbotron () {
      return this.$store.state.jumbotron
    }
  },
  methods: {
    dismissAlert () {
      this.$store.commit('SET_ALERT_VALUE', false)
      console.log('dismissed')
    }
  }
}
</script>