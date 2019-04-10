<template>
  <v-container fluid>
    <h1 class="ml-3 mb-3 pt-4"> {{profileName}} </h1>
    <v-layout justify-start row>
      <v-flex xs2>
        <v-subheader>Dimension Count</v-subheader>
      </v-flex>
      <v-flex xs1
        style="width: 60px"
      >
        <v-text-field
          v-model="dimension"
          class="mt-0"
          hide-details
          single-line
          type="number"
        ></v-text-field>
      </v-flex>
      <v-flex xs2 class="ml-3">
        <v-slider
          v-model="dimension"
          :max="Math.min(facets.length, 2)"
          :min="0"
          :step="1"
        ></v-slider>
      </v-flex>
    </v-layout>
    <v-layout justify-space-around row>
      <v-flex xs4>
        <v-select
          v-for="i in dimension" :key="`facet${i}`"
          v-model="selectedFacet[i-1]"
          :items="facets"
          item-text="name"
          item-value="code"
          :label="`Facet ${i}`"
          return-object
        ></v-select>
        </v-flex>
      <v-flex xs4 class="mx-4">
        <v-text-field
          v-for="i in dimension" :key="`facet${i}`"
          v-model="facetLimit[i-1]"
          :label="`Facet ${i} Limit`"
        ></v-text-field>
        </v-flex>
      <v-flex xs4>
        <v-select
          v-if="dimension >= 1"
          v-model="selectSorting[0]"
          :items="sortingOptions"
          item-text="text"
          item-value="value"
          label="Row Sorting"
          return-object
        ></v-select>
        <v-select
          v-if="dimension >= 2"
          v-model="selectSorting[1]"
          :items="sortingOptions"
          item-text="text"
          item-value="value"
          label="Column Sorting"
          return-object
        ></v-select>
        </v-flex>
      </v-layout>
      <!-- {{f1valuesAmount}} -->
    <v-switch
      label="Include 'none' in facet value"
      v-model="enableNone"
    ></v-switch>
    <v-btn round color="primary" @click="postQuery()">Post Query</v-btn>
    <v-progress-circular v-if="loading" :width="3" :size="50" indeterminate color="green"></v-progress-circular>

    <!-- Automatic Insights -->
    <v-flex v-if="!loading && dimension > 0" xs12>
      <v-card class="mt-3 pb-1">
        <v-card-title class="headline">Insights</v-card-title>
        <v-card-text class="text-xs-left">
          <v-layout row align-content-center>
            <v-flex xs6>
              <div class="subheading font-weight-medium">Most Frequent Facet Values:</div>
              <ul>
                <li v-for="value in insights.top" :key="value">
                  <strong>{{ value }}</strong> ({{amount[value]}})
                </li>
              </ul>
              <div class="subheading font-weight-medium mt-3">Least Frequent Facet Values:</div>
              <ul>
                <li v-for="value in insights.bottom" :key="value">
                  <strong>{{ value }}</strong> ({{amount[value]}})
                </li>
              </ul>
              <div class="subheading font-weight-medium mt-3">Facet with Extreme Attribute Completeness:</div>
              <div v-for="entry in attributes" :key="entry.code">
                <strong v-if="entry">{{ entry.name }} </strong>
                <v-tooltip top>
                  <v-icon slot="activator">info</v-icon>
                  <span v-if="entry">
                    The average completeness for <strong>{{ entry.name }}</strong> is
                    <strong v-if="insights[entry.code]">
                      {{ insights[entry.code].avg.toFixed(2) }}%
                    </strong>
                  </span>
                </v-tooltip>
                <ul>
                  <li v-if="dimension == 1">
                    Most complete on <strong>{{ insights[entry.code].most.name }}</strong>
                    ({{ insights[entry.code].most.value.toFixed(2) }}%)
                  </li>
                  <li v-else>
                    Most complete on <strong>{{ insights[entry.code].most.facet1 + "-" + insights[entry.code].most.facet2 }}</strong>
                    ({{ insights[entry.code].most.value }}%)
                  </li>

                  <li v-if="dimension == 1">
                    Least complete on <strong>{{ insights[entry.code].least.name }}</strong>
                    ({{ insights[entry.code].least.value.toFixed(2) }}%)
                  </li>
                  <li v-else>
                    Least complete on <strong>{{ insights[entry.code].least.facet1 + "-" + insights[entry.code].least.facet2 }}</strong>
                    ({{ insights[entry.code].least.value }}%)
                  </li>

                </ul>
              </div>
            </v-flex>
            <v-flex xs6>
              <div class="subheading font-weight-medium mt-3" v-if="insights.abnormalValues.high.length">
                Attributes with Outlier Completeness (<span class="green--text font-weight-bold">High</span>):
              </div>
              <ul>
                <li v-for="entry in insights.abnormalValues.high" :key="entry.facet1+entry.facet2">
                  <strong>{{ entry.attr }}</strong> on
                  <strong v-if="entry.facet2">{{ entry.facet1 }}-{{ entry.facet2 }}</strong>
                  <strong v-else>{{ entry.facet1 }}</strong>
                  ({{ entry.value }}%)
                  <v-tooltip top>
                    <v-icon slot="activator">info</v-icon>
                    <span>
                      The upper bound value for <strong>{{ entry.attr }}</strong> is
                      <strong>
                        <span v-if="insights[entry.code].upper >= 100">{{ 100 }}%</span>
                        <span v-else>{{ insights[entry.code].upper.toFixed(2) }}%</span>
                      </strong>
                    </span>
                  </v-tooltip>
                </li>
              </ul>
              <div class="subheading font-weight-medium mt-3" v-if="insights.abnormalValues.low.length">
                Attributes with Outlier Completeness (<span class="red--text font-weight-bold">Low</span>):
              </div>
              <ul>
                <li v-for="entry in insights.abnormalValues.low" :key="entry.facet1+entry.facet2">
                  <strong>{{ entry.attr }}</strong> on
                  <strong v-if="entry.facet2">{{ entry.facet1 }}-{{ entry.facet2 }}</strong>
                  <strong v-else>{{ entry.facet1 }}</strong>
                  ({{ entry.value }}%)
                  <v-tooltip top>
                    <v-icon slot="activator">info</v-icon>
                    <span>
                      The lower bound value for <strong>{{ entry.attr }}</strong> is
                      <strong>
                        <span v-if="insights[entry.code].lower <= 0">{{ 0 }}%</span>
                        <span v-else>{{ insights[entry.code].lower.toFixed(2) }}%</span>
                      </strong>
                    </span>
                  </v-tooltip>
                </li>
              </ul>
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-flex>
    <div v-if="dimension == 0" class="mt-3">
      <v-flex xs12>
        <v-card class="px-1 pb-1">
          <v-card-title class="headline">Attribute Completeness Percentage</v-card-title>
          <div class="chart-container">
            <canvas id="chart"></canvas>
          </div>
        </v-card>
      </v-flex>
    </div>
    <div v-if="dimension != 0">
      <div v-for="f1value in f1values" v-bind:key=f1value class="mt-3">
        <v-flex xs12>
          <v-card class="px-1 pb-1">
            <v-card-title class="headline">{{f1value}} ({{amount[f1value]}})</v-card-title>
            <div v-if="dimension == 1" class="chart-container" >
              <canvas :id="f1value"></canvas>
            </div>
            <v-layout v-if="dimension == 2" row align-content-center class="horiz-scroll">
              <v-flex xs4 v-for="f2value in f2vv[f1value]" v-bind:key="f2value">
                <div class="pos-relative">
                  <v-card-title class="headline">{{f2value}} </v-card-title>
                  <v-card-text :id="f1value + f2value + 'amount'"></v-card-text>
                  <canvas :id="f1value + f2value"></canvas>
                </div>
              </v-flex>
            </v-layout>
          </v-card>
        </v-flex>
      </div>
    </div>
  </v-container>
</template>

<script>
import Chart from 'chart.js'
/* eslint-disable */

export default {
  name: 'App',
  async beforeCreate () {
    var store = this.$store
    var router = this.$router.history.current
    await Promise.all([
      store.dispatch('LANGUAGES'),
      store.dispatch('FETCH_PROFILE_BY_ID', router.params.id)
    ])
    this.$data.dimension = this.facets.length
    for (var i = 0; i < this.$data.dimension; i++) {
      if (!this.selectedFacet[i]) {
        this.selectedFacet[i] = this.facets[i]
      }
    }
    this.postQuery()
  },
  data () {
      return {
        on: true,
        insights: {
          top: [],
          bottom: [],
          abnormalValues: {
            high: [],
            low: []
          }
        },
        defaultAmountText: "Amount of entities in this facet: ",
        dimension: 2,
        selectedFacet: [],
        enableNone: false,
        amount: {},
        f1v: [],
        f2v: [],
        f2vv: {},
        loading: false,
        options: {
          responsive: true,
          lineTension: 1,
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                padding: 25,
                suggestedMax: 100,
              }
            }],
            xAxes: [{
                ticks: {
                  autoSkip: false,
                  maxRotation: 90,
                  minRotation: 50
                }
            }]
          },
        },
        facetLimit: [5, 5],
        selectSorting: [
          {text: 'Descending', value: 1},
          {text: 'Descending', value: 1}
        ],
        sortingOptions: [
          {text: 'Descending', value: 1},
          {text: 'Ascending', value: -1}
        ],
      }
  },
  computed: {
    entities () {
      var entities = JSON.parse(JSON.stringify(this.$store.state.entities1))
      return entities
    },
    languages () {
      return this.$store.state.languages
    },
    attributeVariables () {
      var attrs = this.$store.state.attributes
      attrs = attrs.map(obj => obj.code + 'Exist')
      return ['classLabel'].concat(attrs)
    },
    barChartData () {
      return this.$store.state.barChartData
    },
    class () {
      return this.$store.state.class
    },
    facets () {
      var facets = this.$store.state.facets
      return facets
    },
    attributeCodes () {
      var attributes = this.$store.state.attributes
      return attributes.map(attr => attr.code)
    },
    attributeNames () {
      var attributes = this.$store.state.attributes
      var length = 15
      return attributes.map(attr => {
        return attr.name.length > length ? attr.name.substring(0, length - 3) + "..." : attr.name.substring(0, length)
      })
    },
    attributes () {
      return this.$store.state.attributes
    },
    profileName () {
      return this.$store.state.profileName
    },
    facetOptions () {
      return this.facetOptionsData
    },
    subclass () {
      return this.$store.state.subclass
    },
    filters () {
      return this.$store.state.filters
    },
    f1values () {
      return Array.from(this.$data.f1v)
    },
    f2values () {
      return Array.from(this.$data.f2v)
    },
    f1valuesAmount () {
      return this.$data.result_amount
    }
  },
  methods: {
    d1filter (f1, topf1, entities) {
      var f1s = []
      var result = {}

      entities.forEach((entity) => {
        if (entity[f1.code + 'Label']) {
          f1s.push(entity[f1.code + 'Label'].value)
        }
      })

      f1s.push('none')
      f1s = new Set(f1s)

      var result_amount = {}
      f1s.forEach((elem1) => {
        result[elem1] = []
      })

      entities.forEach((entity) => {
        var label1 = entity[f1.code + 'Label'] || { value: 'none' }
        result[label1.value].push(entity)

        // add amount on key1
        result_amount[label1.value] = (result_amount[label1.value] || 0) + 1
      })

      if (!this.$data.enableNone){
        f1s.delete('none')
      }

      var sort_key1 = []
      f1s.forEach((key1) => {
        sort_key1.push({
          'key': key1,
          'amt': result_amount[key1]
        })
        this.$data.amount[key1] = result_amount[key1]
      })

      sort_key1.sort((a, b) => {
        return (b.amt - a.amt) * this.$data.selectSorting[0].value
      })

      sort_key1 = sort_key1.slice(0, topf1)
      this.$data.f1v = sort_key1.map(e => e.key)

      this.$data.insights.top = this.$data.f1v.slice(0, 3)
      this.$data.insights.bottom = this.$data.f1v.slice(-3).reverse()

      return result
    },
    d2filter (f1, f2, topf1, topf2, entities) {
      var f1s = []
      var f2s = []
      var result = {}

      entities.forEach((entity) => {
        if (entity[f1.code + 'Label']) {
          f1s.push(entity[f1.code + 'Label'].value)
        }
        if (entity[f2.code + 'Label']) {
          f2s.push(entity[f2.code + 'Label'].value)
        }
      })

      f1s.push('none')
      f2s.push('none')

      f1s = new Set(f1s)
      f2s = new Set(f2s)

      var result_amount = {}
      var result_amount_key1 = {}
      f1s.forEach((elem1) => {
        result[elem1] = {}
        result_amount_key1[elem1] = {}
        f2s.forEach((elem2) => {
          result[elem1][elem2] = []
        })
      })

      entities.forEach((entity) => {
        var label1 = entity[f1.code + 'Label'] || { value: 'none' }
        var label2 = entity[f2.code + 'Label'] || { value: 'none' }

        result[label1.value][label2.value].push(entity)

        // add amount on key1
        result_amount[label1.value] = (result_amount[label1.value] || 0) + 1
        // add amount on key1Xkey2
        result_amount_key1[label1.value][label2.value] = (result_amount_key1[label1.value][label2.value] || 0) + 1
      })

      if (!this.$data.enableNone){
        f1s.delete('none')
        f2s.delete('none')
      }

      this.$data.f2vv = {}
      var tmp = []
      f1s.forEach((key1) => {
        var sort_key2 = []
        var amt = 0
        f2s.forEach((key2) => {
          sort_key2.push({
            'key': key2,
            'amt': result_amount_key1[key1][key2] || 0
          })
        })
        sort_key2.sort((a, b) => {
          return (b.amt - a.amt) * this.$data.selectSorting[1].value
        })
        sort_key2 = sort_key2.slice(0, topf2)
        sort_key2.forEach((key2) => {
          if(key2.amt) {
            amt += key2.amt
          }
          tmp.push({
            'key1': key1,
            'key2': key2.key,
            'amt': key2.amt || 0
          })
          this.$data.amount[key1 + "-" + key2.key] = key2.amt || 0
        })
        result_amount[key1] = amt
        this.$data.f2vv[key1] = sort_key2.map(e => e.key)
      })

      var sort_key1 = []
      f1s.forEach((key1) => {
        sort_key1.push({
          'key': key1,
          'amt': result_amount[key1]
        })
        this.$data.amount[key1] = result_amount[key1]
      })

      sort_key1.sort((a, b) => {
        return (b.amt - a.amt) * this.$data.selectSorting[0].value
      })

      sort_key1 = sort_key1.slice(0, topf1)
      this.$data.f1v = sort_key1.map(e => e.key)

      tmp = tmp.filter(e => this.$data.f1v.includes(e.key1)
              ).sort((a, b) => b.amt - a.amt 
              ).map(e => e.key1 + "-" + e.key2)

      this.$data.insights.top = tmp.slice(0, 3)
      this.$data.insights.bottom = tmp.slice(-3).reverse()

      return result
    },
    d0Processing (dataset) {
      // this.$data.f1v.forEach((value1) => {
      //   if (typeof dataset[value1] == 'undefined') {
      //     return
      //   }
        var chartData = {
          labels: this.attributeNames,
          datasets: []
        }
        var data = []
        var subset = dataset
        var size = subset.length

        this.attributeCodes.forEach((attribute) => {
          var sum = subset.reduce((acc, entity) => {
            var attributeExists = entity[attribute + 'Label'] || 'none'
            if (attributeExists == 'none') {
              return acc
            } else {
              return acc + 1
            }
          }, 0)
          var percentage = Number.parseFloat(sum / size * 100).toFixed(2)
          data.push(percentage)
        })

        chartData.datasets.push({
          label: 'Average Completeness',
          backgroundColor: '#41b883',
          data: data
        })

        this.$nextTick(() => {
          this.createChart("chart", chartData)
        })
      // })
    },
    d1Processing (dataset) {
      this.$data.f1v.forEach((value1) => {
        if (typeof dataset[value1] == 'undefined') {
          return
        }
        var chartData = {
          labels: this.attributeNames,
          datasets: []
        }
        var data = []
        var subset = dataset[value1]
        var size = subset.length

        if (size == 0) {
          return
        }

        this.attributeCodes.forEach((attribute) => {
          var sum = subset.reduce((acc, entity) => {
            var attributeExists = entity[attribute + 'Label'] || 'none'
            if (attributeExists == 'none') {
              return acc
            } else {
              return acc + 1
            }
          }, 0)
          var percentage = Number.parseFloat(sum / size * 100).toFixed(2)
          // console.log(value1, value2, attribute, percentage)
          this.$data.insights[attribute].values.push({
            facet1: value1,
            value: percentage
          })
          data.push(percentage)
        })

        chartData.datasets.push({
          label: 'Average Completeness',
          backgroundColor: '#41b883',
          data: data
        })

        this.$nextTick(() => {
          this.createChart(value1, chartData)
        })
      })
    },
    d2Processing (dataset) {
      this.$data.f1v.forEach((value1) => {

        this.$data.f2vv[value1].forEach((value2) => {
          if (typeof dataset[value1][value2] == 'undefined') {
            return
          }
          var chartData = {
            labels: this.attributeNames,
            datasets: []
          }
          var data = []
          var subset = dataset[value1][value2]
          var size = subset.length

          if (size == 0) {
            return
          }

          this.attributeCodes.forEach((attribute) => {
            var sum = subset.reduce((acc, entity) => {
              var attributeExists = entity[attribute + 'Label'] || 'none'
              if (attributeExists == 'none') {
                return acc
              } else {
                return acc + 1
              }
            }, 0)
            var percentage = Number.parseFloat(sum / size * 100).toFixed(2)
            // console.log(value1, value2, attribute, percentage)
            this.$data.insights[attribute].values.push({
              facet1: value1,
              facet2: value2,
              value: percentage
            })
            data.push(percentage)
          })

          chartData.datasets.push({
            label: 'Average Completeness',
            backgroundColor: '#41b883',
            data: data
          })

          this.$nextTick(() => {
            const ctx = document.getElementById(value1 + value2 + 'amount')
            if (ctx) {
              ctx.innerText = this.defaultAmountText + size
              this.createChart(value1 + value2, chartData)
            }
          })
        })
      })
    },
    createChart (chartId, chartData) {
      // console.log(chartData)
      const ctx = document.getElementById(chartId)
      new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: this.$data.options,
      })
    },
    processVisualisation (entities) {
      entities.forEach((entity) => {
        var exist = Object.keys(entity).length - 2
        entity.score = (exist / 5) * 100
      })

      var dataset = entities
      if (this.$data.dimension == 2) {
        // console.log("2!!")
        dataset = this.d2filter( this.$data.selectedFacet[0],
                            this.$data.selectedFacet[1],
                            this.$data.facetLimit[0],
                            this.$data.facetLimit[1],
                            entities)
      } else if (this.$data.dimension == 1) {
        // console.log("1!!")
        dataset = this.d1filter( this.$data.selectedFacet[0],
                            this.$data.facetLimit[0],
                            entities)
      }

      this.$data.insights.topValues = {}
      this.$data.insights.top.forEach((value) => {
        this.$data.insights.topValues[value] = {}
        this.attributeCodes.forEach((code) => {
          this.$data.insights.topValues[value][code] = []
        })
      })
      this.attributeCodes.forEach((code) => {
        this.$data.insights[code] = {}
        this.$data.insights[code].values = []
      })

      this.$data.insights.abnormalValues = {
        high: [],
        low: []
      }

      if (this.$data.dimension == 2) {
        this.d2Processing(dataset)
      } else if (this.$data.dimension == 1) {
        this.d1Processing(dataset)
      } else {
        this.d0Processing(dataset)
      }

      if (this.$data.dimension != 0) {
          this.attributes.forEach((attr) => {
          this.$data.insights[attr.code].values.sort((a,b) => a.value - b.value)
          var len = this.$data.insights[attr.code].values.length
          var q2 = parseInt(len / 2)
          var q1Value = this.$data.insights[attr.code].values[parseInt(q2 / 2)].value
          var q3Value = this.$data.insights[attr.code].values[parseInt( (len + q2) / 2)].value

          var iqr = q3Value - q1Value

          var top = parseFloat(q3Value) + (iqr * 1.5)
          var bottom = parseFloat(q1Value) - (iqr * 1.5)

          this.$data.insights[attr.code].upper = top
          this.$data.insights[attr.code].lower = bottom
          var valuesByFacet = {}
          valuesByFacet.values = []
          this.$data.insights[attr.code].values.forEach((entry) => {

            if (this.$data.dimension == 1) {
              if (!valuesByFacet[entry.facet1]) {
                valuesByFacet[entry.facet1] = []
              }
              valuesByFacet[entry.facet1].push(entry.value)
            }

            if (entry.value > top) {
              this.$data.insights.abnormalValues.high.push({
                attr: attr.name,
                code: attr.code,
                facet1: entry.facet1,
                facet2: entry.facet2,
                value: entry.value
              })
            } else if (entry.value < bottom) {
              this.$data.insights.abnormalValues.low.push({
                attr: attr.name,
                code: attr.code,
                facet1: entry.facet1,
                facet2: entry.facet2,
                value: entry.value
              })
            }
          })

          if (this.$data.dimension == 2) {
            // console.log(this.$data.insights[attr.code])
            this.$data.insights[attr.code].avg = this.$data.insights[attr.code].values.reduce((acc, e) => acc + parseFloat(e.value), 0) / this.$data.insights[attr.code].values.length
            this.$data.insights[attr.code].least = this.$data.insights[attr.code].values[0]
            this.$data.insights[attr.code].most = this.$data.insights[attr.code].values[this.$data.insights[attr.code].values.length-1]
            // console.log(this.$data.insights[attr.code])
          } else if (this.$data.dimension == 1) {
            this.$data.f1v.forEach((facet) => {
              var avg = valuesByFacet[facet].reduce((acc, e) => acc + parseFloat(e), 0) / valuesByFacet[facet].length
              valuesByFacet.values.push({
                name: facet,
                value: avg
              })
            })
            valuesByFacet.values.sort((a,b) => a.value - b.value)
            // console.log(valuesByFacet.values)
            this.$data.insights[attr.code].avg = valuesByFacet.values.reduce((acc, e) => acc + parseFloat(e.value), 0) / valuesByFacet.values.length
            this.$data.insights[attr.code].least = valuesByFacet.values[0]
            this.$data.insights[attr.code].most = valuesByFacet.values[valuesByFacet.values.length-1]
          }
          
        })

        // console.log(this.$data.insights)
      }
    },
    postQuery () {
      this.loading = true
      var queryLabel = this.attributeCodes.reduce((acc, code) => {
        return acc + ` ?${code}Label`
      }, "")
      queryLabel = this.facets.reduce((acc, facet) => {
        return acc + ` ?${facet.code}Label`
      }, queryLabel)
      // console.log(queryLabel)

      var queryFilter = this.filters.reduce((acc, filter) => {
        return acc + ` ?entity wdt:${filter.prop.code} wd:${filter.value.code}.`
      }, "")
      // console.log(queryFilter)

      var queryOptional = this.attributeCodes.reduce((acc, code) => {
        return acc + ` OPTIONAL {?entity wdt:${code} ?${code}}`
      }, "")
      queryOptional = this.facets.reduce((acc, facet) => {
        return acc + ` OPTIONAL {?entity wdt:${facet.code} ?${facet.code}}`
      }, queryOptional)
      // console.log(queryOptional)

      var includeSubclass = ''
      if (this.subclass) includeSubclass = '/wdt:P279*'

      var query = `
        SELECT ?entity ?entityLabel ${queryLabel}
        WHERE {
          ?entity wdt:P31${includeSubclass} wd:${this.class.code}.
          ${queryFilter}
          ${queryOptional}
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
      `

      this.$axios.post('https://query.wikidata.org/sparql?query=' + encodeURIComponent(query))
        .then((response) => {
          var entities = response.data.results.bindings
          this.$store.commit('SET_ENTITIES1', entities)

          this.processVisualisation(entities)

          this.loading = false
        })
        .catch((error) => {
          console.log(error)
        })
    }
  },
  watch: {
    dimension: function (newDimesion, oldDimension) {
      this.processVisualisation(this.entities)
    },
    selectedFacet: function (newFacets, oldFacets) {
      this.processVisualisation(this.entities)
    },
    facetLimit: function (newFacets, oldFacets) {
      this.processVisualisation(this.entities)
    },
    selectSorting: function (newFacets, oldFacets) {
      this.processVisualisation(this.entities)
    },
    enableNone: function (newFacets, oldFacets) {
      this.processVisualisation(this.entities)
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

.chart-container {
  position: relative;
  margin: auto;
  height: 50        vh;
  width: 49vw;
}
</style>
