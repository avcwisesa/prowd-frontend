<template>
  <v-container fluid>
     <v-data-table
        :headers="headers"
        :items="profiles"
        class="elevation-1"
      >
        <template slot="items" slot-scope="props">
          <td>{{ props.item.name }}</td>
          <td class="text-xs-right"> anonymous </td>
          <td class="text-xs-right">{{ props.item.CreatedAt }}</td>
          <td class="text-xs-right">{{ props.item.UpdatedAt }}</td>
          <td class="text-xs-right">
            <v-menu
              transition="slide-y-transition"
              bottom
              open-on-hover
            >
              <template slot="activator">
                <v-btn
                  class="purple"
                  color="primary"
                  dark
                >
                  actions <v-icon>expand_more</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-tile
                  v-for="(action, i) in items"
                  :key="i"
                  @click="action.func(props.item.ID)"
                  :class="'grey--text text--lighten-4 ' + action.color"
                >
                  <v-list-tile-title >
                    {{ action.title }}
                  </v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>
          </td>
        </template>
        <template slot="no-data">
          <v-alert :value="true" color="orange" icon="warning">
            There are no existing profile. Click <a @click="goToCreate()">here</a> to create a new one
          </v-alert>
        </template>
      </v-data-table>
  </v-container>
</template>

<script>
/* eslint-disable */

export default {
  beforeCreate () {
    this.$store.dispatch('FETCH_PROFILE')
  },
  data () {
    return {
      API_ENDPOINT: 'http://prowd.id:8080',
      facetValue: {},
      query: '',
      datacollection: null,
      headers: [
        {
          text: 'Profile Title',
          align: 'left',
          sortable: false,
          value: 'name'
        },
        { text: 'Created By', value: 'carbs' },
        { text: 'Created At', value: 'CreatedAt' },
        { text: 'Last Modified At', value: 'UpdatedAt' },
        { text: 'Action', sortable: false }
      ],
      items: [
        { title: 'SEE PROFILE', func: this.goTo, color: 'primary'},
        { title: 'COMPARE', func: this.compare, color: 'blue'},
        { title: 'MDA', func: this.mda, color: 'accent'},
        { title: 'EDIT', func: this.details, color: 'brown'}
      ]
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