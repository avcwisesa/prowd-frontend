<template>
  <v-layout row wrap>
    <v-flex v-for="profile in profiles" v-bind:key="profile.ID" xs12 sm8 md6>
      <v-card class="mx-1">
        <v-card-title class="headline">{{profile.name}}</v-card-title>
        <v-card-actions class="mb-2">
             <v-btn round
                    @click="goTo(profile.ID)"
                    class="grey--text text--lighten-4"
                    color="primary">SEE PROFILE</v-btn>
             <v-btn round
                    @click="compare(profile.ID)"
                    class="grey--text text--lighten-4"
                    color="blue">COMPARE</v-btn>
            <v-btn round
                    @click="mda(profile.ID)"
                    class="grey--text text--lighten-4"
                    color="accent">MDA</v-btn>
             <v-btn round
                    @click="details(profile.ID)"
                    class="grey--text text--lighten-4"
                    color="brown">EDIT</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
    <v-flex v-if="profiles.length == 0" xs12 sm8 md6>
      <v-card >
        <v-card-text>There are no existing profile. Click below to create a new one</v-card-text>
        <v-card-actions>
             <v-btn round @click="goToCreate()" color="green">CREATE NEW PROFILE</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
/* eslint-disable */

export default {
  beforeCreate () {
    console.log("coy")
    this.$store.dispatch('FETCH_PROFILE')
  },
  data () {
    return {
      API_ENDPOINT: "https://guarded-fjord-56608.herokuapp.com",
      facetValue: {},
      query: '',
      datacollection: null
    }
  },
  computed: {
    profiles () {
      console.log(this.$store.state.profiles)
      return this.$store.state.profiles
    }
  },
  methods: {
    goTo (ID) {
      this.$router.push({'path': '/profile/' + ID})
    },
    compare (ID) {
      this.$router.push({'path': '/profile/compare/' + ID})
    },
    mda (ID) {
      this.$router.push({'path': '/profile/mda/' + ID})
    },
    goToCreate () {
      this.$router.push({'path': '/profile/new'})
    },
    details (ID) {
      this.$router.push({'path': '/profile/details/' + ID})
    }
  }
}
</script>