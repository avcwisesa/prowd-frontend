<template>
  <v-layout row wrap>
    <v-flex xs12 sm10 md10>
      <v-card >
        <v-card-title class="headline">Create new profile</v-card-title>

        <v-layout row wrap>
            <v-flex xs3>
                <v-subheader><h3>Profile Name</h3></v-subheader>
            </v-flex>
            <v-flex xs7>
                <v-text-field v-model=profileName required
                    class="input-group--focused"
                ></v-text-field>
            </v-flex>
            <v-flex xs3>
                <v-subheader><h3>Author</h3></v-subheader>
            </v-flex>
            <v-flex xs7>
                <v-text-field v-model=author required
                    class="input-group--focused"
                ></v-text-field>
            </v-flex>
            <v-flex xs3>
                <v-subheader><h3>Description</h3></v-subheader>
            </v-flex>
            <v-flex xs7>
                <v-textarea v-model=description required box
                    class="input-group--focused mt-2"
                ></v-textarea>
            </v-flex>
            <v-flex xs12>
              <v-layout row>
                <v-flex xs3>
                  <v-subheader><h3>Class</h3></v-subheader>
                </v-flex>
                <v-flex xs7>
                  <v-layout column>
                    <v-flex xs7>
                      <h3 class="white--text mt-3">{{ profileClass['label'] }} ({{ profileClass['id'] }})</h3>
                      <v-card-text> {{ profileClass['description'] }} </v-card-text>
                      <v-autocomplete
                        v-model="profileClass" label="Search class" :items="suggestionClass" required box
                        item-text="label" return-object :search-input.sync="currClass"
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
                              <v-list-tile-title >{{data.item.label}} ({{data.item.id}})</v-list-tile-title>
                              <v-list-tile-sub-title>{{data.item.description}}</v-list-tile-sub-title>
                            </v-list-tile-content>
                          </template>
                        </template>
                      </v-autocomplete>
                    </v-flex>
                    <v-flex xs3></v-flex>
                    <v-flex xs8>
                      <v-switch
                        :label="'Include subclasses'"
                        v-model="subclass"
                      ></v-switch>
                    </v-flex>
                    <v-flex xs3></v-flex>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex xs3>
              <v-subheader><h3>Filters</h3></v-subheader>
            </v-flex>
            <v-flex xs8>
              <v-layout class="mt-2" column>
                <v-flex>
                  <v-card-text v-if="filters.length === 0">No filter</v-card-text>
                  <v-chip v-else v-for="filter in filters" v-bind:key="filter.code" close
                  @input="remove(filters, filter)"
                  >
                    {{filter.prop.label}}: {{filter.value.label}}
                  </v-chip>
                </v-flex>
                <v-flex>
                  <v-layout class="mt-2" row wrap>
                    <v-flex xs4 class="mt-3">
                      <v-autocomplete
                        v-model="filterProp" label="Property" :items="suggestionFilterProp" required
                        item-text="label" return-object :search-input.sync="currProp"
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
                              <v-list-tile-title >{{data.item.label}} ({{data.item.id}})</v-list-tile-title>
                              <v-list-tile-sub-title>{{data.item.description}}</v-list-tile-sub-title>
                            </v-list-tile-content>
                          </template>
                        </template>
                      </v-autocomplete>
                    </v-flex>
                    <v-flex xs4 class="mt-3 mx-3">
                      <v-autocomplete
                        v-model="filterValue" label="Value" :items="suggestionFilterValue" required
                        item-text="label" return-object :search-input.sync="currValue"
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
                              <v-list-tile-title >{{data.item.label}} ({{data.item.id}})</v-list-tile-title>
                              <v-list-tile-sub-title>{{data.item.description}}</v-list-tile-sub-title>
                            </v-list-tile-content>
                          </template>
                        </template>
                      </v-autocomplete>
                    </v-flex>
                    <v-flex class="xs1 ml-3">
                      <v-btn
                        dark
                        fab
                        top
                        small
                        right
                        color="blue"
                        @click="addFilter()"
                      >
                        <v-icon>add</v-icon>
                      </v-btn>
                    </v-flex>
                    <v-flex>
                      <v-tooltip top>
                        <v-icon large class="mt-4"
                          slot="activator"
                          color="orange"
                          dark
                        >help_outline</v-icon>
                        <span>Choose property and value, then click the '+' button</span>
                      </v-tooltip>
                    </v-flex>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex xs3>
              <v-subheader><h3>Facets</h3></v-subheader>
            </v-flex>
            <v-flex xs8>
              <v-combobox
                v-model="facets" label="Add facets" chips multiple clearable required
                item-text="label" :items="suggestionFacet" :search-input.sync="currFacet"
              >
                  <template slot="selection" slot-scope="data">
                      <v-chip
                      :selected="data.selected"
                      close
                      @input="remove(facets, data.item)"
                      >
                      <strong>{{ data.item['id'] }}</strong>&nbsp;
                      <span>({{data.item['label']}})</span>
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
                        <v-list-tile-title >{{data.item.label}} ({{data.item.id}})</v-list-tile-title>
                        <v-list-tile-sub-title>{{data.item.description}}</v-list-tile-sub-title>
                      </v-list-tile-content>
                    </template>
                  </template>
              </v-combobox>
            </v-flex>
            <v-flex xs3>
              <v-subheader><h3>Attributes</h3></v-subheader>
            </v-flex>
            <v-flex xs4>
              <v-combobox
                v-model="attributes" label="Add attributes" chips multiple clearable required
                item-text="label" :items="suggestionAttribute" :search-input.sync="currAttribute"
              >
                <template slot="selection" slot-scope="data">
                    <v-chip
                    :selected="data.selected"
                    close
                    @input="remove(attributes, data.item)"
                    >
                    <strong>{{ data.item['id'] }}</strong>&nbsp;
                    <span>({{data.item['label']}})</span>
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
                      <v-list-tile-title >{{data.item.label}} ({{data.item.id}})</v-list-tile-title>
                      <v-list-tile-sub-title>{{data.item.description}}</v-list-tile-sub-title>
                    </v-list-tile-content>
                  </template>
                </template>
              </v-combobox>
            </v-flex>
            <v-flex xs5>
              <v-layout column>
                <v-flex>
                  <span class="text-xs-center subheading">Attribute Suggestions</span>
                </v-flex>
                <v-flex class="mx-3 mt-3">
                  <v-progress-linear v-if="recommendationLoading" :indeterminate="true"></v-progress-linear>
                  <span v-if="attributeRecommendation.length == 0 && !recommendationLoading" class="text-xs-center">No recommendation</span>
                  <v-chip v-for="attribute in attributeRecommendation.slice(0,10)" :key="attribute.code"
                    color="wikiBlue" text-color="white" @click="addAttribute(attribute)">
                    <strong>{{ attribute.id }}</strong>&nbsp;
                    <span>({{ attribute.label }})</span>&nbsp;
                    <v-icon>add</v-icon>
                  </v-chip>
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex xs12><v-card-text></v-card-text></v-flex>
            <v-flex xs6 offset-xs3 class="mb-3">
              <v-card-actions>
                <v-btn block round @click="createProfile()" color="blue"
                  class="subheading font-weight-medium white--text">CREATE</v-btn>
              </v-card-actions>
            </v-flex>
        </v-layout>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
/* eslint-disable */

export default {
  async fetch ({ store, params }) {
    // await store.dispatch('FETCH_PROFILE')
  },
  data () {
    return {
      API_ENDPOINT: 'http://prowd.id:8080',
      profileName: '',
      author: '',
      description: '',
      profileClass: { label: 'Empty', id: 'undefined', description: '-' },
      facets: [],
      attributes: [],
      filters: [],
      filterProp: {},
      filterValue: {},
      subclass: false,
      currClass: '',
      currFacet: '',
      currAttribute: '',
      currProp: '',
      currValue: '',
      attributeRecommendation: [],
      recommendationFilter: new Set(['P31']),
      recommendationLoading: false
    }
  },
  computed: {
    newProfile () {
      return {
        name: this.profileName,
        author: this.author,
        description: this.description,
        class: JSON.stringify({ code: this.profileClass['id'], name: this.profileClass['label'] }),
        facets: JSON.stringify(this.facets.map(obj => {
          return {
            code: obj['id'],
            name: obj['label']
          }
        })),
        attributes: JSON.stringify(this.attributes.map(obj => {
          return {
            code: obj['id'],
            name: obj['label']
          }
        })),
        filters: JSON.stringify(this.filters.map(obj => {
          return {
            prop: {
              code: obj.prop['id'],
              name: obj.prop['label']
            },
            value: {
              code: obj.value['id'],
              name: obj.value['label']
            }
          }
        })),
        subclass: this.subclass
      }
    },
    suggestionClass () {
      return this.$store.state.suggestionClass
    },
    suggestionFilterValue () {
      return this.$store.state.suggestionFilterValue
    },
    suggestionFilterProp () {
      return this.$store.state.suggestionFilterProp
    },
    suggestionFacet () {
      return this.$store.state.suggestionFacet
    },
    suggestionAttribute () {
      return this.$store.state.suggestionAttribute
    }
  },
  watch: {
    currClass (query) {
      this.suggestion('SET_SUGGESTION_CLASS', query, 'item', 'entity')
    },
    currProp (query) {
      this.suggestion('SET_SUGGESTION_FILTER_PROP', query, 'property', 'filterProp')
    },
    currValue (query) {
      this.suggestion('SET_SUGGESTION_FILTER_VALUE', query, 'item', 'filterEntity')
    },
    currFacet (query) {
      this.suggestion('SET_SUGGESTION_FACET', query, 'property', 'facetProp')
    },
    currAttribute (query) {
      this.suggestion('SET_SUGGESTION_ATTRIBUTE', query, 'property', 'attrProp')
    },
    profileClass: function (newClass, oldClass) {
      this.attributeSuggestion()
    },
    filters: function (newFilters, oldFilters) {
      this.attributeSuggestion()
      newFilters.forEach((filter) => {
        this.recommendationFilter.add(filter.prop.id)
      })
      this.attributeSuggestionFilter()
    },
    facets: function (newFacets, oldFacets) {
      newFacets.forEach((facet) => {
        this.recommendationFilter.add(facet.id)
      })
      this.attributeSuggestionFilter()
      this.attributeSuggestion()
    },
    attributes: function (newAttributes, oldAttributes) {
      newAttributes.forEach((attribute) => {
        this.recommendationFilter.add(attribute.id)
      })
      this.attributeSuggestionFilter()
      this.attributeSuggestion()
    },
  },
  methods: {
    async createProfile () {
      console.log(this.newProfile)
      await this.$store.dispatch('CREATE_PROFILE', this.newProfile)
      this.$router.push({'path': '/profile/browse'})
    },
    remove (data, item) {
      data.splice(data.indexOf(item), 1)
      data = [...data]
    },
    addFilter () {
      this.filters.push({
        prop: this.filterProp,
        value: this.filterValue
      })
    },
    addAttribute (attribute) {
      this.attributes.push(attribute)
    },
    suggestion (slot, query, type, queryType) {
      this.$store.dispatch('SUGGESTER', { slot: slot, type: type, query: query })
    },
    async attributeSuggestion () {
      var filterQuery = this.filters.reduce((acc, filter) => {
        return acc + ` ?s wdt:${filter.prop.id} wd:${filter.value.id}.`
      }, "")

      var includeSubclass = ''
      if (this.subclass) includeSubclass = '/wdt:P279*'

      var query = `
        SELECT ?pFull ?pFullLabel ?cnt {
          ?pFull wikibase:directClaim ?p .
          MINUS {?pFull <http://wikiba.se/ontology#propertyType> <http://wikiba.se/ontology#ExternalId>}
          {
            SELECT ?p (COUNT(?s) AS ?cnt) {
             SELECT DISTINCT ?s ?p WHERE {
                {SELECT DISTINCT ?s {
                  { SELECT ?s WHERE {
                    ?s wdt:P31${includeSubclass} wd:${this.profileClass.id}.
                    ${filterQuery}
                  } LIMIT 1000 }
                }}
                OPTIONAL {
                  ?s ?p ?o .
                  FILTER(STRSTARTS(STR(?p),"http://www.wikidata.org/prop/direct/")) # only select direct statements
                }
              }
            } GROUP BY ?p
          }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". } # get labels
        } ORDER BY DESC(?cnt)
        limit 50
      `

      // console.log(query)
      this.recommendationLoading = true
      this.$axios.post("https://query.wikidata.org/" + 'sparql?query=' + encodeURIComponent(query))
      .then((response) => {
        var attributes = response.data.results.bindings
        this.attributeRecommendation = attributes.reduce((acc, attribute) => {
          acc.push({ id: attribute.pFull.value.split('/')[4], label: attribute.pFullLabel.value })
          return acc
        }, [])
        this.attributeSuggestionFilter()
        this.recommendationLoading = false
      })
      .catch((error) => {
        console.log(error)
      })
    },
    attributeSuggestionFilter () {
      this.attributeRecommendation = this.attributeRecommendation.filter(
        (attribute) => !this.recommendationFilter.has(attribute.id)
      )
    }
  }
}
</script>

<style>
.rborder {
  border: 2px solid #7A1D2A;
}
</style>
