<template>
  <v-container fluid>
    <h1 class="ml-3 mb-3 pt-4"> {{profileName}} </h1>
    <v-layout justify-space-around row>
      <v-flex xs4>
        <v-select
          v-for="i in 2" :key="`facet${i}`"
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
          v-for="i in 2" :key="`facet${i}`"
          v-model="facetLimit[i-1]"
          :label="`Facet ${i} Limit`"
        ></v-text-field>
        </v-flex>
      <v-flex xs4>
        <v-select
          v-model="selectRowSorting"
          :items="sortingOptions"
          item-text="text"
          item-value="value"
          label="Row Sorting"
          return-object
        ></v-select>
        <v-select
          v-model="selectColSorting"
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
    <v-flex v-if="!loading" xs12>
      <v-card class="mt-3 pb-1">
        <v-card-title class="headline">Insights</v-card-title>
        <v-card-text class="text-xs-left">
          <v-layout row align-content-center>
            <v-flex xs6>
              <div class="subheading font-weight-medium">Most Populated Facets:</div>
              <ul>
                <li v-for="value in insights.top" :key="value">
                  <strong>{{ value }}</strong> ({{amount[value]}})
                </li>
              </ul>
              <div class="subheading font-weight-medium mt-3">Least Populated Facets:</div>
              <ul>
                <li v-for="value in insights.bottom" :key="value">
                  <strong>{{ value }}</strong> ({{amount[value]}})
                </li>
              </ul>
              <!--<ul>
                <li v-for="value in insights.top" :key="value">
                  <strong>{{ value }}</strong>
                  's most completed attribute is 
                  <strong>{{ insights.topValues[value].highest.name }}</strong>
                </li>
              </ul>--> 
              <div class="subheading font-weight-medium mt-3">Facet Where Attributes are Most Complete:</div>
              <ul>
                <li v-for="entry in attributes" :key="entry.code">
                  <strong>{{ entry.name }}</strong> is most complete on 
                  <strong>{{ insights[entry.code].most.name }}</strong>
                  ({{ insights[entry.code].most.value.toFixed(2) }}%)
                </li>
              </ul>
              <div class="subheading font-weight-medium mt-3">Facet Where Attributes are Least Complete:</div>
              <ul>
                <li v-for="entry in attributes" :key="entry.code">
                  <strong>{{ entry.name }}</strong> is least complete on 
                  <strong>{{ insights[entry.code].least.name }}</strong>
                  ({{ insights[entry.code].least.value.toFixed(2) }}%)
                </li>
              </ul>
            </v-flex>
            <v-flex xs6>
              <div class="subheading font-weight-medium">Attributes with Outlier Completeness (<span class="blue--text font-weight-bold">High</span>):</div>
              <ul>
                <li v-for="entry in insights.abnormalValues.high" :key="entry.facet1+entry.facet2">
                  the value of <strong>{{ entry.attr }}</strong> on 
                  <strong>{{ entry.facet1 }}-{{ entry.facet2 }}</strong>
                </li>
              </ul>
              <div class="subheading font-weight-medium mt-3">Attributes with Outlier Completeness (<span class="red--text font-weight-bold">Low</span>):</div>
              <ul>
                <li v-for="entry in insights.abnormalValues.low" :key="entry.facet1+entry.facet2">
                  the value of <strong>{{ entry.attr }}</strong> on 
                  <strong>{{ entry.facet1 }}-{{ entry.facet2 }}</strong>
                </li>
              </ul>
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-flex>
    <div  v-for="f1value in f1values" v-bind:key=f1value class="mt-3">
      <v-flex xs12>
        <v-card class="px-1 pb-1">
          <v-card-title class="headline">{{f1value}} ({{amount[f1value]}})</v-card-title>
          <v-layout row align-content-center class="horiz-scroll">
            <v-flex xs4 v-for="f2value in f2vv[f1value]" v-bind:key=f2value>
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
    console.log("store", store.state.facets)
    this.postQuery()
  },
  data () {
      return {
        insights: {
          top: [],
          bottom: [],
          abnormalValues: {
            high: [],
            low: []
          }
        },
        defaultAmountText: "Amount of entities in this facet: ",
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
        datacollection: {},
        facetLimit: [5, 5],
        selectRowSorting: {text: 'Descending', value: 1},
        selectColSorting: {text: 'Descending', value: 1},
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
      console.log("facet option",this.selectedFacet)
      if (!this.selectedFacet[0]) {
        this.selectedFacet[0] = facets[0]
      }
      if (!this.selectedFacet[1]) {
        this.selectedFacet[1] = facets[1]
      }
      // console.log(selectedFacet)
      // console.log(this.selectedFacet[0])
      // console.log(this.selectedFacet[0])
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
    f (f1, f2, topf1, topf2, entities) {
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
          return (b.amt - a.amt) * this.$data.selectColSorting.value
        })
        sort_key2 = sort_key2.slice(0, topf2)
        sort_key2.forEach((key2) => {
          if(key2.amt) {
            amt += key2.amt
          }
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
        return (b.amt - a.amt) * this.$data.selectRowSorting.value
      })

      sort_key1 = sort_key1.slice(0, topf1)
      this.$data.f1v = sort_key1.map(e => e.key)

      return result
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
      // console.log(query)

      this.$axios.post('https://query.wikidata.org/sparql?query=' + encodeURIComponent(query))
        .then((response) => {
          var entities = response.data.results.bindings
          this.$store.commit('SET_ENTITIES1', entities)

          entities.forEach((entity) => {
            var exist = Object.keys(entity).length - 2
            entity.score = (exist / 5) * 100
          })

          var dataset = this.f( this.$data.selectedFacet[0],
                                this.$data.selectedFacet[1],
                                this.$data.facetLimit[0],
                                this.$data.facetLimit[1],
                                entities)
          // console.log(dataset)
          var attributes = this.attributeCodes

          this.$data.insights.top = this.$data.f1v.slice(0, 3)
          this.$data.insights.bottom = this.$data.f1v.slice(-3).reverse()
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
          // console.log(this.$data.insights)

          this.$data.f1v.forEach((value1) => {
            this.$data.datacollection[value1] = {}
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

              attributes.forEach((attribute) => {
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

              // console.log(data)
              // console.log(this.attributeNames)
              chartData.datasets.push({
                label: 'Average Completeness',
                backgroundColor: '#41b883',
                data: data
              })

              this.$nextTick(() => {
                const ctx = document.getElementById(value1 + value2 + 'amount')
                ctx.innerText = this.defaultAmountText + size
                this.createChart(value1 + value2, chartData)
              })
            })
          })

          this.attributes.forEach((attr) => {
            this.$data.insights[attr.code].values.sort((a,b) => a.value - b.value)
            var len = this.$data.insights[attr.code].values.length
            var q2 = parseInt(len / 2)
            var q1Value = this.$data.insights[attr.code].values[parseInt(q2 / 2)].value
            var q3Value = this.$data.insights[attr.code].values[parseInt( (len + q2) / 2)].value
            // console.log(q1Value, q2, q3Value)
            var iqr = q3Value - q1Value
            // console.log(iqr, typeof(iqr))
            // console.log(q1Value, typeof(q1Value))
            // console.log(q3Value, typeof(q3Value))
            var top = parseFloat(q3Value) + (iqr * 1.5)
            var bottom = parseFloat(q1Value) - (iqr * 1.5)
            // console.log("top & bottom", top, bottom)
            // var avg = arr.reduce((acc, e) => acc + parseInt(e.value), 0) / arr.length
            var valuesByFacet = {}
            valuesByFacet.values = []
            this.$data.insights[attr.code].values.forEach((entry) => {
              if (!valuesByFacet[entry.facet1]) {
                 valuesByFacet[entry.facet1] = []
              }
              valuesByFacet[entry.facet1].push(entry.value)

              if (entry.value > top) {
                this.$data.insights.abnormalValues.high.push({
                  attr: attr.name,
                  facet1: entry.facet1,
                  facet2: entry.facet2,
                  value: entry.value
                })
                // console.log("Higher than normal", attr.name, entry.facet1, entry.facet2, entry.value, top)
              } else if (entry.value < bottom) {
                this.$data.insights.abnormalValues.low.push({
                  attr: attr.name,
                  facet1: entry.facet1,
                  facet2: entry.facet2,
                  value: entry.value
                })
                // console.log("Lower than normal", attr.name, entry.facet1, entry.facet2, entry.value, bottom)
              }
              // this.$data.insights.top.forEach((value) => {
              //   if (entry.facet1 == value) {
              //     this.$data.insights.topValues[value][attr.code].push(entry.value)
              //   }
              // })
            })
            // console.log(valuesByFacet)
            this.$data.f1v.forEach((facet) => {
              var avg = valuesByFacet[facet].reduce((acc, e) => acc + parseFloat(e), 0) / valuesByFacet[facet].length
              valuesByFacet.values.push({
                name: facet,
                value: avg
              })
            })
            valuesByFacet.values.sort((a,b) => a.value - b.value)
            // console.log(valuesByFacet.values)
            this.$data.insights[attr.code].least = valuesByFacet.values[0]
            this.$data.insights[attr.code].most = valuesByFacet.values[valuesByFacet.values.length-1]
          })
          // this.$data.insights.top.forEach((value) => {
          //   var highest = { value: 0}
          //   this.attributes.forEach((attr) => {
          //     // console.log(this.$data.insights.topValues)
          //     var tmp = this.$data.insights.topValues[value][attr.code].reduce((acc, val) => acc + parseFloat(val), 0)
          //     tmp /= this.$data.insights.topValues[value][attr.code].length
          //     if (tmp >= highest.value) {
          //       highest.name = attr.name,
          //       highest.value = tmp
          //     }
          //   })
          //   // console.log(value, highest)
          //   this.$data.insights.topValues[value].highest = highest
          // })
          console.log(this.$data.insights)

          this.loading = false
        })
        .catch((error) => {
          console.log(error)
        })
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
