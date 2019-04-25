<!-- eslint-disable vue/no-use-v-if-with-v-for,vue/no-confusing-v-for-v-if -->
<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <div class="text-xs-center">
        <!-- <img src="/v.png" alt="Vuetify.js" class="mb-5" /> -->
      </div>
      <!-- <v-card> -->
        <v-card-title class="headline"> {{profileName}} Profile Comparison </v-card-title>
        <v-card-text>
          <div class="bar-chart">
            <h2>Completeness Distribution</h2>
            <v-card-text>Amount of entities according to completeness score</v-card-text>
            <BarChart :chart-data="datacollection" :options="chartOptions"/>
          </div>
          <v-layout class="my-4" row wrap>
            <v-flex xs4>
                <h2>Class Filters</h2>
            </v-flex>
            <v-flex xs3>
              <v-card-text v-if="filters.length === 0">No filter</v-card-text>
              <v-chip v-else v-for="filter in filters" v-bind:key="filter.prop.code"
              @input="remove(filters, filter)"
              >
                {{filter.prop.name}}: {{filter.value.name}}
              </v-chip>
            </v-flex>
          </v-layout>
          <v-divider class="my-4"></v-divider>
          <h2>Profile 1</h2>
          <v-layout row wrap>
            <v-flex xs8>
              <v-layout v-for="facet in facets" v-bind:key="facet.code" row wrap>
                  <v-flex xs6>
                      <v-subheader> {{facet.name}} ({{facet.code}}) </v-subheader>
                  </v-flex>
                  <v-flex xs6>
                      <v-autocomplete :items="facetOptions[facet.code]" v-model="facetValue[1][facet.code]" item-text="name" item-value="code"
                          class="input-group--focused" placeholder="any"
                      ></v-autocomplete>
                  </v-flex>
              </v-layout>
            </v-flex>
            <v-flex xs4>
              <v-layout row wrap>
                <v-flex xs12>
                  <h3 class="text-xs-center"> &nbsp; &nbsp;Average Completeness Score</h3>
                </v-flex>
                <v-flex xs3></v-flex>
                <v-flex x5>
                  <v-progress-circular class="text-xs-center"
                    :size="200"
                    :width="25"
                    :rotate="-90"
                    :value="score1"
                    color=blue
                  >
                    <h1> {{ score1 }}% </h1>
                  </v-progress-circular>
                </v-flex>
                <v-flex xs12>
                  <h3 class="text-xs-center">Total number of entities: {{ entities1.length }}</h3>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
          <v-divider class="my-4"></v-divider>
          <h2>Profile 2</h2>
          <v-layout row wrap>
            <v-flex xs8>
              <v-layout v-for="facet in facets" v-bind:key="facet.code" row wrap>
                  <v-flex xs6>
                      <v-subheader> {{facet.name}} ({{facet.code}}) </v-subheader>
                  </v-flex>
                  <v-flex xs6>
                      <v-autocomplete :items="facetOptions[facet.code]" v-model="facetValue[2][facet.code]" item-text="name" item-value="code"
                          class="input-group--focused" placeholder="any"
                      ></v-autocomplete>
                  </v-flex>
              </v-layout>
            </v-flex>
            <v-flex xs4>
              <v-layout row wrap>
                <v-flex xs12>
                  <h3 class="text-xs-center"> &nbsp; &nbsp;Average Completeness Score</h3>
                </v-flex>
                <v-flex xs3></v-flex>
                <v-flex x5>
                  <v-progress-circular class="text-xs-center"
                    :size="200"
                    :width="25"
                    :rotate="-90"
                    :value="score2"
                    color=orange
                  >
                    <h1> {{ score2 }}% </h1>
                  </v-progress-circular>
                </v-flex>
                <v-flex xs12>
                  <h3 class="text-xs-center">Total number of entities: {{ entities2.length }}</h3>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>

          <v-layout row wrap>
            <v-flex xs2 v-if="facets.length > 0">
              <v-btn @click="compareProfile()" color="success"> Post Query </v-btn>
            </v-flex>
            <v-flex xs3>
              <v-progress-circular v-if="loading" :width="3" :size="50" indeterminate color="green"></v-progress-circular>
            </v-flex>
            <v-flex xs12>
              <v-alert
                v-model=warning outline dismissible
                type="warning"
              >
                Current version of the app only support up to 20.000 entities
              </v-alert>
            </v-flex>
          </v-layout>

        </v-card-text>
      <!-- </v-card> -->
    </v-flex>
    <v-flex xs12>
      <!-- <v-card> -->
        <v-card-title class="headline mt-3"> Attribute Completeness Score </v-card-title>
        <v-card-text class="text-xs-left">Degree of completeness for attributes of interest</v-card-text>

        <v-layout column align-content-center class="horiz-scroll">
          <h2 class="ml-4 my-3">Profile 1</h2>
          <v-layout row>
          <v-flex class="px-3 mx-5 mt-2" xs3 v-for="attr in attributes" v-bind:key="attr.code">
            <v-layout align-center justify-center column fill-height>
              <v-flex xs12>
                <v-tooltip top>
                  <h3 class="text-xs-center">{{ truncateString(15)(`${attr.name} (${attr.code})`)}}</h3>
                  <span>{{ `${attr.name} (${attr.code})` }}</span>
                </v-tooltip>
              </v-flex>
              <v-flex class="my-2">
                <v-progress-circular
                  :size="130"
                  :width="15"
                  :rotate="-90"
                  :value="attr.score"
                  :color="getColor(attr.score)"
                >
                  <h2> {{ (attr.score).toFixed(2) }}% </h2>
                </v-progress-circular>
              </v-flex>
              <v-flex xs12 class="mx-3">
                <h3 class="text-xs-center">{{ attr.count }} Entities</h3>
              </v-flex>
            </v-layout>
          </v-flex>
          </v-layout>
          <h2 class="ml-4 my-3">Profile 2</h2>
          <v-layout row>
          <v-flex class="px-3 mx-5 my-3" xs3 v-for="attr in attributes2" v-bind:key="attr.code">
            <v-layout align-center justify-center column fill-height>
              <v-flex xs12>
                <v-tooltip top>
                  <h3 class="text-xs-center">{{ truncateString(15)(`${attr.name} (${attr.code})`)}}</h3>
                  <span>{{ `${attr.name} (${attr.code})` }}</span>
                </v-tooltip>
              </v-flex>
              <v-flex class="my-2">
                <v-progress-circular
                  :size="130"
                  :width="15"
                  :rotate="-90"
                  :value="attr.score"
                  :color="getColor(attr.score)"
                >
                  <h2> {{ (attr.score).toFixed(2) }}% </h2>
                </v-progress-circular>
              </v-flex>
              <v-flex xs12 class="mx-3">
                <h3 class="text-xs-center">{{ attr.count }} Entities</h3>
              </v-flex>
            </v-layout>
          </v-flex>
          </v-layout>
        </v-layout>
      <!-- </v-card> -->
    </v-flex>
    <v-flex xs12>
      <!-- <v-card> -->
        <v-card-title class="display-1 mt-3"> Completeness table </v-card-title>
          <v-card-text class="text-xs-left">Completeness details of all entities within the profile</v-card-text>

              <div class="headline ml-3 my-2 text-xs-left">Profile 1</div>
                <v-data-table
                  :headers="headers"
                  :items="entities1"
                  :pagination.sync="pagination"
                  class="elevation-1"
                >
                  <template slot="items" slot-scope="props">
                    <td v-for="attr in attributeVariables" v-bind:key="attr.code" v-if="props.item[attr]" class="text-xs-center">
                      <div v-if="attr === 'classLabel'">
                        <a v-bind:href="props.item['class'].value">
                          <v-icon>link</v-icon>
                        </a>
                        {{props.item[attr]}}
                      </div>
                      <div v-else><v-icon color="green light">check</v-icon></div>
                    </td>
                    <td v-else class="text-xs-center">
                      <v-icon color="red">close</v-icon>
                    </td>
                    <td class="text-xs-center">{{ (props.item.score).toFixed(2)+'%' }}</td>
                  </template>
                </v-data-table>

              <div class="headline ml-3 my-3 text-xs-left">Profile 2</div>
                <v-data-table
                  :headers="headers"
                  :items="entities2"
                  :pagination.sync="pagination"
                  class="elevation-1"
                >
                  <template slot="items" slot-scope="props">
                    <td v-for="attr in attributeVariables" v-bind:key="attr.code" v-if="props.item[attr]" class="text-xs-center">
                      <div v-if="attr === 'classLabel'">
                        <a v-bind:href="props.item['class'].value">
                          <v-icon>link</v-icon>
                        </a>
                        {{props.item[attr]}}
                      </div>
                      <div v-else><v-icon color="green light">check</v-icon></div>
                    </td>
                    <td v-else class="text-xs-center">
                      <v-icon color="red">close</v-icon>
                    </td>
                    <td class="text-xs-center">{{ (props.item.score).toFixed(2)+'%' }}</td>
                  </template>
                </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
import BarChart from '@/components/BarChart.vue'
/* eslint-disable */

export default {
  components: {
    BarChart
  },
  async beforeCreate () {
    var store = this.$store
    var router = this.$router.history.current
    await Promise.all([
      store.dispatch('LANGUAGES'),
      store.dispatch('FETCH_PROFILE_BY_ID', router.params.id),
      store.dispatch('FETCH_FACET_OPTIONS')
    ])
    store.commit('SET_SCORE1', 0)
    store.commit('SET_SCORE2', 0)
    await this.compareProfile()
    await this.fillFacets()
    console.log('done')
  },
  data () {
    return {
      pagination: {
        rowsPerPage: 10
      },
      query: '',
      warning: false,
      datacollection: null,
      colors: ['red', 'orange', 'yellow'],
      datasets: [],
      barColor1: 'blue',
      barcolor2: 'orange',
      facetValue: { '1': { 'any': 'any' }, '2': { 'any': 'any' } },
      facetOptionsData: {},
      loading: false,
      chartOptions: {
        maintainAspectRatio: false,
        animation: {
          duration: 0
        },
        hover: {
          animationDuration: 0
        },
        responsiveAnimationDuration: 0,
        scales: {
          yAxes: [{
            ticks: {
              min: 0
            }
          }]
        }
      }
    }
  },
  computed: {
    profileName () {
      return this.$store.state.profileName
    },
    headers () {
      var entityClass = this.$store.state.class
      var ret = [].concat(this.$store.state.attributes)
      ret = ret.map(obj => {
        return { text: obj.name + ' (' + obj.code + ')', value: obj.code + 'Exist' }
      })
      ret = [{ text: entityClass.name + ' (' + entityClass.code + ')', value: 'classLabel' }].concat(ret)
      var headers = ret.concat({ text: 'completeness score', value: 'score' })
      return headers
    },
    class () {
      return this.$store.state.class
    },
    facets () {
      return this.$store.state.facets
    },
    facetOptions () {
      return this.facetOptionsData
    },
    attributes () {
      var entities = JSON.parse(JSON.stringify(this.$store.state.entities1))
      var attributes = JSON.parse(JSON.stringify(this.$store.state.attributes))
      var amount = {}

      attributes.forEach(function (attr) {
        amount[attr.code] = 0
      })

      entities.forEach(function (entity) {
        attributes.forEach(function (attr) {
          if (entity[attr.code + 'Exist']) {
            amount[attr.code] += 1
          }
        })
      })

      attributes.forEach(function (attr) {
        attr.count = amount[attr.code]
        attr.score = (100 * attr.count / entities.length)
      })

      return attributes.sort(function (a, b) {
        return a.name.localeCompare(b.name)
      })
    },
    attributes2 () {
      var entities = JSON.parse(JSON.stringify(this.$store.state.entities2))
      var attributes = JSON.parse(JSON.stringify(this.$store.state.attributes))
      var amount = {}

      attributes.forEach(function (attr) {
        amount[attr.code] = 0
      })

      entities.forEach(function (entity) {
        attributes.forEach(function (attr) {
          if (entity[attr.code + 'Exist']) {
            amount[attr.code] += 1
          }
        })
      })

      attributes.forEach(function (attr) {
        attr.count = amount[attr.code]
        attr.score = (100 * attr.count / entities.length)
      })

      return attributes.sort(function (a, b) {
        return a.name.localeCompare(b.name)
      })
      // return this.$store.state.attributes.slice()
    },
    attributeVariables () {
      var attrs = this.$store.state.attributes
      attrs = attrs.map(obj => obj.code + 'Exist')
      return ['classLabel'].concat(attrs)
    },
    entities1 () {
      var entities = this.$store.state.entities1
      var attributes = this.$store.state.attributes

      entities.forEach(function (entity) {
        entity.classLabel = entity.classLabel.value
        entity.score = (100 * (Object.keys(entity).length - 2) / attributes.length)
      })

      return entities
    },
    entities2 () {
      var entities = this.$store.state.entities2
      var attributes = this.$store.state.attributes

      entities.forEach(function (entity) {
        entity.classLabel = entity.classLabel.value
        entity.score = (100 * (Object.keys(entity).length - 2) / attributes.length)
      })

      return entities
    },
    barChartData () {
      return this.$store.state.barChartData
    },
    datacollectionComputed () {
      return this.datacollection
    },
    subclass () {
      return this.$store.state.subclass
    },
    filters () {
      return this.$store.state.filters
    },
    score1 () {
      return this.$store.state.score1
    },
    score2 () {
      return this.$store.state.score2
    }
  },
  methods: {
    getColor (i) {
      var red = i < 50 ? 255 : 255 - (255.0 / 100 * ((i - 50) * 2));
      var green = i < 50 ? 180.0 / 100 * (i * 2) : 180;

      return `rgb(${red},${green},0)`
    },
    truncateString (len) {
      return str => {
        return str.length > len ? str.substring(0, len - 3) + "..." : str.substring(0, len)
      }
    },
    async postQuery (id) {
      this.loading = true
      console.log(this.attributeVariables)
      console.log(this.attributes)
      var attributeVarQuery = this.attributeVariables.reduce(function (acc, attr) {
        return acc + ' ?' + attr
      }, '')
      var filterExistQuery = this.attributes.reduce(function (acc, attr) {
        return acc + ` OPTIONAL {BIND ("TRUE" AS ?${attr.code}Exist) FILTER EXISTS{?class wdt:${attr.code} ?${attr.code}}}`
      }, '')
      var facetValue = this.facetValue[id]
      var facetQuery = this.facets.reduce(function (acc, attr) {
        if (facetValue[attr.code] !== 'any') {
          return acc.concat({ code: attr.code, value: 'wd:' + facetValue[attr.code] })
        } else {
          return acc
        }
      }, [])
      var facetQueryString = facetQuery.reduce(function (acc, attr) {
        if (attr.value !== 'wd:undefined') {
          return acc + ` ?class wdt:${attr.code} ${attr.value}.`
        } else {
          return acc + ''
        }
      }, '')
      var includeSubclass = ''
      if (this.subclass) includeSubclass = '/wdt:P279*'

      var classFilterQueryString = this.filters.reduce(function (acc, filter) {
        return acc + ` ?class wdt:${filter.prop.code} wd:${filter.value.code}.`
      }, '')

      var query = `
        SELECT DISTINCT ?class ${attributeVarQuery}
        WHERE {
        ${classFilterQueryString}
        ?class wdt:P31${includeSubclass} wd:${this.class.code}.
        ${facetQueryString}
        ${filterExistQuery}
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
        }
        LIMIT 20000
      `
      console.log(query)
      return this.$axios.post("https://query.wikidata.org/" + 'sparql?query=' + encodeURIComponent(query))
    },
    fillFacets () {
      var classFilterQueryString = this.filters.reduce(function (acc, filter) {
        return acc + ` ?entity wdt:${filter.prop.code} wd:${filter.value.code}.`
      }, '')

      var facetOptionsResults = this.facets.map(async (facet) => {
        var includeSubclass = ''
        if (this.subclass) includeSubclass = '/wdt:P279*'
        var query = `
        SELECT DISTINCT ?facet ?facetLabel ?${facet.code}
          WHERE {
            SELECT ?facet ?facetLabel ?${facet.code}
            WHERE {
              ?entity wdt:P31${includeSubclass} wd:${this.class.code}.
              ${classFilterQueryString}
              ?entity wdt:${facet.code} ?facet.
              SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en,id,de,it". }
            }
            LIMIT 10000
          }
        `
        return this.$axios.post("https://query.wikidata.org/" + 'sparql?query=' + encodeURIComponent(query))
      })
      Promise.all(facetOptionsResults).then((completed) => {
        var tmp = {}
        completed.forEach(function (response) {
          tmp[response.data.head.vars[2]] = response.data.results.bindings.map((obj) => {
            return {
              code: obj['facet']['value'].split('/')[4],
              name: obj['facetLabel']['value']
            }
          }).concat({ name: 'any', code: 'any' }).sort(function (a, b) {
            if (a.name > b.name) {
              return 1
            } else if (a.name < b.name) {
              return -1
            } else {
              return 0
            }
          })
        })
        this.facetOptionsData = tmp
      })
    },
    processResponse (response, id, barColor, setTable, setScore) {
      var entities = response.data.results.bindings
      this.$store.commit(setTable, entities)

      const reducer = function (acc, country) {
        var exist = Object.keys(country).length - 2
        acc[exist] = acc[exist] + 1 || 1
        return acc
      }
      var attributes = this.attributes.concat([''])
      var acc = Array.apply(null, Array(attributes.length)).map(Number.prototype.valueOf, 0)

      var chartData = entities.reduce(reducer, acc)

      var score = 0
      var div = 100 / chartData.length
      chartData.forEach(function (val, i) {
        var weight = (i + 1) * div
        score += (weight * val)
      })
      score /= entities.length
      this.$store.commit(setScore, parseFloat(score.toFixed(2)))

      this.datasets.push({
        label: `Facet ${id}`,
        backgroundColor: barColor,
        data: chartData
      })
    },
    async compareProfile () {
      this.loading = true
      this.datasets = []
      const response1 = this.postQuery(1)
      const response2 = this.postQuery(2)
      const [data1, data2] = await Promise.all([response1, response2])
      this.processResponse(data1, 1, this.barColor1, 'SET_ENTITIES1', 'SET_SCORE1')
      this.processResponse(data2, 2, this.barcolor2, 'SET_ENTITIES2', 'SET_SCORE2')
      var attributes = this.attributes.concat([''])
      this.datacollection = await {
        labels: attributes.map((_, x) => `${(100 * (x) / this.attributes.length).toFixed(2)}%`),
        datasets: this.datasets
      }
      this.loading = false

      this.warning = (this.entities1.length === 20000 || this.entities2.length === 20000)
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.overflow-hidden {
  overflow: hidden;
}
.horiz-scroll {
  overflow-y: hidden;
  overflow-x: auto;
}
</style>