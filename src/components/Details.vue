<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-card>
        <v-card-title class="headline"> {{profileName}} - Details </v-card-title>
        <v-card-text>
          <h2>Profile name:</h2>
          <v-text-field v-model=profileName required
              class="input-group--focused"
          ></v-text-field>
          <h2>Description</h2>
          <v-textarea v-model=description required
              class="input-group--focused"
          ></v-textarea>
          <h2>Class:</h2>
          <h2 class="black--text mt-3">{{ profileClass.name }} ({{ profileClass.code }})</h2>
          <v-card-text> {{ profileClass['description'] }} </v-card-text>
          <v-autocomplete
            v-model="profileClass" label="Search class" :items="suggestedEntity" required box
            item-text="name" return-object :search-input.sync="currClass"
          >
            <template
              slot="item"
              slot-scope="data"
            >
              <template v-if="typeof data.item !== 'object'">
                <v-list-tile-content v-text="data.item"></v-list-tile-content>
              </template>
              <template v-else>
                <v-list-tile-content>
                  <v-list-tile-title >{{data.item.name}} ({{data.item.code}})</v-list-tile-title>
                  <v-list-tile-sub-title>{{data.item.description}}</v-list-tile-sub-title>
                </v-list-tile-content>
              </template>
            </template>
          </v-autocomplete>
          <v-switch
            :label="'Include subclasses'"
            v-model="subclass"
          ></v-switch>
          <h3>Filters</h3>
          <v-card-text v-if="filters.length === 0">No filter</v-card-text>
          <v-chip v-else v-for="filter in filters" v-bind:key="filter.code" close
          @input="remove(filters, filter)"
          >
            {{filter.prop.name}}: {{filter.value.name}}
          </v-chip>
          <v-layout class="mt-2" row wrap>
            <v-flex xs4 class="mt-3">
              <v-autocomplete
                v-model="filterProp" label="Property" :items="suggestedProp" required
                item-text="name" return-object :search-input.sync="currProp"
              >
                <template
                  slot="item"
                  slot-scope="data"
                >
                  <template v-if="typeof data.item !== 'object'">
                    <v-list-tile-content v-text="data.item"></v-list-tile-content>
                  </template>
                  <template v-else>
                    <v-list-tile-content>
                      <v-list-tile-title >{{data.item.name}} ({{data.item.code}})</v-list-tile-title>
                      <v-list-tile-sub-title>{{data.item.description}}</v-list-tile-sub-title>
                    </v-list-tile-content>
                  </template>
                </template>
              </v-autocomplete>
            </v-flex>
            <v-flex xs4 class="mt-3 mx-3">
              <v-autocomplete
                v-model="filterValue" label="Value" :items="suggestedEntity" required
                item-text="name" return-object :search-input.sync="currValue"
              >
                <template
                  slot="item"
                  slot-scope="data"
                >
                  <template v-if="typeof data.item !== 'object'">
                    <v-list-tile-content v-text="data.item"></v-list-tile-content>
                  </template>
                  <template v-else>
                    <v-list-tile-content>
                      <v-list-tile-title >{{data.item.name}} ({{data.item.code}})</v-list-tile-title>
                      <v-list-tile-sub-title>{{data.item.description}}</v-list-tile-sub-title>
                    </v-list-tile-content>
                  </template>
                </template>
              </v-autocomplete>
            </v-flex>
            <v-flex class="ml-3">
              <v-btn
                dark
                fab
                top
                small
                right
                color="pink"
                @click="addFilter()"
              >
                <v-icon>add</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
          <h3 class="mt-3">Facets: </h3>
          <v-combobox
            v-model="facets" label="Edit facets" chips multiple clearable required
            item-text="label" :items="suggestedProp" :search-input.sync="currFacet"
          >
            <template slot="selection" slot-scope="data">
                <v-chip
                :selected="data.selected"
                close
                @input="remove(facets, data.item)"
                >
                <strong>{{ data.item['code'] }}</strong>&nbsp;
                <span>({{data.item['name']}})</span>
                </v-chip>
            </template>
            <template
              slot="item"
              slot-scope="data"
            >
              <template v-if="typeof data.item !== 'object'">
                <v-list-tile-content v-text="data.item"></v-list-tile-content>
              </template>
              <template v-else>
                <v-list-tile-content>
                  <v-list-tile-title >{{data.item.name}} ({{data.item.code}})</v-list-tile-title>
                  <v-list-tile-sub-title>{{data.item.description}}</v-list-tile-sub-title>
                </v-list-tile-content>
              </template>
            </template>
          </v-combobox>
          <h3>Attributes: </h3>
          <v-combobox
            v-model="attributes" label="Edit attributes" chips multiple clearable required
            item-text="label" :items="suggestedProp" :search-input.sync="currAttribute"
          >
            <template slot="selection" slot-scope="data">
                <v-chip
                :selected="data.selected"
                close
                @input="remove(attributes, data.item)"
                >
                <strong>{{ data.item['code'] }}</strong>&nbsp;
                <span>({{data.item['name']}})</span>
                </v-chip>
            </template>
            <template
              slot="item"
              slot-scope="data"
            >
              <template v-if="typeof data.item !== 'object'">
                <v-list-tile-content v-text="data.item"></v-list-tile-content>
              </template>
              <template v-else>
                <v-list-tile-content>
                  <v-list-tile-title >{{data.item.name}} ({{data.item.code}})</v-list-tile-title>
                  <v-list-tile-sub-title>{{data.item.description}}</v-list-tile-sub-title>
                </v-list-tile-content>
              </template>
            </template>
          </v-combobox>
          <v-layout class="mt-4" row wrap>
            <v-flex class="mx-1" xs2>
              <v-dialog full-width
                v-model="updateDialog"
                width="500"
              >
                <v-btn slot="activator" block color="orange"> UPDATE </v-btn>

                <v-card>
                  <v-card-title
                    class="headline grey"
                    primary-title
                  >
                    Update Profile
                  </v-card-title>

                  <v-card-text>
                      Are you sure you want to update this profile?
                  </v-card-text>

                  <v-card-text>
                    <h2>Profile name: {{profileName}}</h2>
                    <h2>Class: {{ `${profileClass.name} (${profileClass.code})` }}</h2>
                    <div v-if="subclass">(subclass included)</div>
                    <h3 class="mt-3">Filters: </h3>
                    <v-chip v-for="filter in filters" v-bind:key="filter.code">{{ `${filter.prop.name}: ${filter.value.name}` }}</v-chip>
                    <h3 class="mt-3">Facets: </h3>
                    <v-chip v-for="facet in facets" v-bind:key="facet.code">{{ `${facet.name} (${facet.code})` }}</v-chip>
                    <h3>Attributes: </h3>
                    <v-chip v-for="attribute in attributes" v-bind:key="attribute.code">{{ `${attribute.name} (${attribute.code})` }}</v-chip>
                  </v-card-text>

                  <v-divider></v-divider>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="orange"
                      flat
                      @click="updateProfile()"
                    >
                      UPDATE
                    </v-btn>
                    <v-btn
                      color="blue"
                      flat
                      @click="updateDialog = false"
                    >
                      CANCEL
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-flex>
            <v-flex class="mx-1" xs2>
              <v-dialog full-width
                v-model="deleteDialog"
                width="500"
              >
                <v-btn slot="activator" block color="red"> DELETE </v-btn>

                <v-card>
                  <v-card-title
                    class="headline grey"
                    primary-title
                  >
                    Delete Profile
                  </v-card-title>

                  <v-card-text>
                      Are you sure you want to delete this profile?
                  </v-card-text>

                  <v-divider></v-divider>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="red"
                      flat
                      @click="deleteProfile()"
                    >
                      DELETE
                    </v-btn>
                    <v-btn
                      color="blue"
                      flat
                      @click="deleteDialog = false"
                    >
                      CANCEL
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-flex>
          </v-layout>

        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
/* eslint-disable */
export default {
  async beforeCreate () {
    var router = this.$router.history.current
    await this.$store.dispatch('FETCH_PROFILE_BY_ID', router.params.id)
    this.profileName = this.$store.state.profileName
    this.subclass = this.$store.state.subclass
    this.profileClass = this.$store.state.class
    this.description = this.$store.state.description
    console.log(this.profileClass)
    this.attributes = this.$store.state.attributes
    this.facets = this.$store.state.facets
    this.filters = this.$store.state.filters
    this.$forceUpdate()
  },
  data () {
    return {
      API_ENDPOINT: process.env.API_ENDPOINT,
      profileName: 'Anonymous',
      description: 'No description',
      profileClass: { label: 'Empty', id: 'undefined', description: '-' },
      currClass: null,
      currFacet: '',
      currAttribute: '',
      currProp: '',
      currValue: '',
      subclass: false,
      attributes: [],
      facets: [],
      filters: [],
      filterProp: {},
      filterValue: {},
      updateDialog: false,
      deleteDialog: false
    }
  },
  computed: {
    newProfile () {
      return {
        name: this.profileName,
        description: this.description,
        class: JSON.stringify({ code: this.profileClass.code, name: this.profileClass.name }),
        filters: JSON.stringify(this.filters.map(obj => {
          return {
            prop: {
              name: obj.prop.name,
              code: obj.prop.code
            },
            value: {
              name: obj.value.name,
              code: obj.value.code
            }
          }
        })),
        facets: JSON.stringify(this.facets.map(obj => {
          return {
            code: obj.code,
            name: obj.name
          }
        })),
        attributes: JSON.stringify(this.attributes.map(obj => {
          return {
            code: obj.code,
            name: obj.name
          }
        })),
        subclass: this.subclass
      }
    },
    profileID () {
      return this.$route.params.id
    },
    suggestedEntity () {
      var entities = []
      this.$store.state.suggestedEntity.forEach(element => {
        entities.push({
          name: element.label,
          code: element.id,
          description: element.description
        })
      })
      return entities
    },
    suggestedProp () {
      return this.$store.state.suggestedProperty
    }
  },
  watch: {
    currAttribute (query) {
      this.propertySuggestion(query)
    },
    currFacet (query) {
      this.propertySuggestion(query)
    },
    currClass (query) {
      this.entitySuggestion(query)
    },
    currProp (query) {
      this.propertySuggestion(query)
    },
    currValue (query) {
      this.entitySuggestion(query)
    }
  },
  methods: {
    async deleteProfile () {
      await this.$store.dispatch('DELETE_PROFILE', { name: this.profileName, id: this.profileID })
      this.$router.push({'path': '/profile/browse'})
    },
    async updateProfile () {
      console.log(this.newProfile)
      await this.$store.dispatch('UPDATE_PROFILE', {id: this.profileID, profile: this.newProfile})
      this.$router.push({'path': '/profile/' + this.profileID})
    },
    addFilter () {
      this.filters.push({
        prop: this.filterProp,
        value: this.filterValue
      })
    },
    remove (data, item) {
      data.splice(data.indexOf(item), 1)
      data = [...data]
    },
    entitySuggestion (query) {
      this.$store.dispatch('SUGGESTER', { type: 'item', query: query })
    },
    propertySuggestion (query) {
      this.$store.dispatch('SUGGESTER', { type: 'property', query: query })
    }
  }
}
</script>
