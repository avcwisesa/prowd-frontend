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
          :rules="[rules.maxDimension]"
          class="mt-0"
          type="number"
        ></v-text-field>
      </v-flex>
      <v-flex xs2 class="ml-3">
        <v-slider
          v-model="dimension"
          :max="Math.min(facets.length, maxDimension)"
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
          v-for="i in dimension" :key="`facet${i}`"
          v-model="selectSorting[i-1]"
          :items="sortingOptions"
          item-text="text"
          item-value="value"
          :label="`Facet ${i} Sorting`"
          return-object
        ></v-select>
        </v-flex>
      </v-layout>
    <v-switch
      label="Include 'none' in facet value"
      v-model="enableNone"
    ></v-switch>
    <v-btn round color="primary" @click="postQuery()">Refresh Dataset</v-btn>
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
                  <li>
                    Most complete on <strong>{{ insights[entry.code].most.name }}</strong>
                    ({{ insights[entry.code].most.value.toFixed(2) }}%)
                  </li>

                  <li>
                    Least complete on <strong>{{ insights[entry.code].least.name }}</strong>
                    ({{ insights[entry.code].least.value.toFixed(2) }}%)
                  </li>

                </ul>
              </div>
            </v-flex>
            <v-flex xs6>
              <div class="subheading font-weight-medium" v-if="insights.completenessScore.high.length">
                Facets with highest overall attribute completeness:
              </div>
              <ul>
                <li v-for="entry in insights.completenessScore.high" :key="entry.name">
                  <strong>{{ entry.name }}</strong>
                  ({{entry.score.toFixed(2)}}% with {{ amount[entry.name] }} entities)
                </li>
              </ul>
              <div class="subheading font-weight-medium mt-3" v-if="insights.completenessScore.low.length">
                Facets with lowest overall attribute completeness:
              </div>
              <ul>
                <li v-for="entry in insights.completenessScore.low" :key="entry.name">
                  <strong>{{ entry.name }}</strong>
                  ({{entry.score.toFixed(2)}}% with {{ amount[entry.name] }} entities)
                </li>
              </ul>
              <div class="subheading font-weight-medium mt-3" v-if="insights.abnormalValues.high.length">
                Attributes with Outlier Completeness (<span class="green--text font-weight-bold">High</span>):
              </div>
              <ul>
                <li v-for="entry in insights.abnormalValues.high" :key="entry.name">
                  <strong>{{ entry.attr }}</strong> on
                  <strong>{{ entry.name }}</strong>
                  ({{ entry.value.toFixed(2) }}%)
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
                <li v-for="entry in insights.abnormalValues.low" :key="entry.name">
                  <strong>{{ entry.attr }}</strong> on
                  <strong>{{ entry.name }}</strong>
                  ({{ entry.value.toFixed(2) }}%)
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
    <div v-if="dimension != 0 && dimension != 3">
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
                  <v-tooltip top>
                    <v-card-title slot="activator" class="headline">{{ truncateString(16)(f2value) }} ({{ amount[`${f1value}-${f2value}`] }})</v-card-title>
                    <span>{{ f2value }}</span>
                  </v-tooltip>
                  <canvas :id="`${f1value}-${f2value}`"></canvas>
                </div>
              </v-flex>
            </v-layout>
          </v-card>
        </v-flex>
      </div>
    </div>
    <div v-if="dimension == 3">
      <v-card v-if="dimension == 3" class="mt-3">
        <v-card-title class="headline">Layer Selection</v-card-title>
        <v-flex xs4 class="ml-3">
        <v-select
          v-model="layer"
          :items="layerValues"
          item-value="key"
          :label="`Layer`"
        >
          <template slot="item" slot-scope="data">
            {{ data.item.key }} ({{ data.item.amt }})
          </template>
          <template slot="selection" slot-scope="data">
            {{ data.item.key }}
          </template>
        </v-select>
        </v-flex>
      </v-card>
      <div v-for="f1value in d3f1v[layer]" v-bind:key=f1value class="mt-3">
        <v-flex xs12>
          <v-card class="px-1 pb-1">
            <v-card-title class="headline">{{f1value}} ({{amount[`${layer}-${f1value}`]}})</v-card-title>
            <v-layout row align-content-center class="horiz-scroll">
              <v-flex xs4 v-for="f2value in d3f2vv[layer][f1value]" v-bind:key="f2value">
                <div class="pos-relative">
                  <v-tooltip top>
                    <v-card-title slot="activator" class="headline">{{ truncateString(16)(f2value) }} ({{ amount[`${layer}-${f1value}-${f2value}`] }})</v-card-title>
                    <span>{{ f2value }}</span>
                  </v-tooltip>
                  <canvas class="chart" :id="`${layer}-${f1value}-${f2value}`"></canvas>
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
    this.$data.dimension = Math.min(this.facets.length, this.$data.maxDimension)
    for (var i = 0; i < this.$data.dimension; i++) {
      this.$data.selectSorting[i] = this.$data.sortingOptions[0]
      this.$data.facetLimit[i] = 5
      if (!this.selectedFacet[i]) {
        this.selectedFacet[i] = this.facets[i]
      }
    }
    this.postQuery()
  },
  data () {
      return {
        maxDimension: 3,
        on: true,
        insights: {
          top: [],
          bottom: [],
          abnormalValues: {
            high: [],
            low: []
          }
        },
        dimension: 2,
        selectedFacet: [],
        enableNone: false,
        amount: {},
        layerValues: [],
        layer: null,
        f1v: [],
        d3f1v: {},
        f2v: [],
        f2vv: {},
        d3f2vv: {},
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
        rules: {
          required: value => !!value || 'Required.',
          maxDimension: value => value <= this.$data.maxDimension || `Max dimension is ${this.$data.maxDimension}`
        },
        facetLimit: [],
        selectSorting: [],
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
      return attributes.map(attr => attr.name).map(this.truncateString(15))
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
    d1filter (facets, limits, entities) {
      var f1s = []
      var result = {}
      var checkDuplicate = {}

      entities.forEach((entity) => {
        if (entity[facets[0].code + 'Label']) {
          f1s.push(entity[facets[0].code + 'Label'].value)
        }
      })

      f1s.push('none')
      f1s = new Set(f1s)

      var result_amount = {}
      f1s.forEach((elem1) => {
        result[elem1] = []
        checkDuplicate[elem1] = new Set()
      })


      entities.forEach((entity) => {
        // console.log(entity)
        var label1 = entity[facets[0].code + 'Label'] || { value: 'none' }

        if (checkDuplicate[label1.value].has(entity.entity.value)) {
          return
        }

        checkDuplicate[label1.value].add(entity.entity.value)
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

      sort_key1 = sort_key1.slice(0, limits[0])
      this.$data.f1v = sort_key1.map(e => e.key)

      this.$data.insights.top = this.$data.f1v.slice(0, 3)
      this.$data.insights.bottom = this.$data.f1v.slice(-3).reverse()

      return result
    },
    d2filter (facets, limits, entities) {
      var f1s = []
      var f2s = []
      var result = {}
      var checkDuplicate = {}

      entities.forEach((entity) => {
        if (entity[facets[0].code + 'Label']) {
          f1s.push(entity[facets[0].code + 'Label'].value)
        }
        if (entity[facets[1].code + 'Label']) {
          f2s.push(entity[facets[1].code + 'Label'].value)
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
        checkDuplicate[elem1] = {}
        checkDuplicate[elem1]['null'] = new Set()
        f2s.forEach((elem2) => {
          result[elem1][elem2] = []
          checkDuplicate[elem1][elem2] = new Set()
        })
      })

      entities.forEach((entity) => {
        var label1 = entity[facets[0].code + 'Label'] || { value: 'none' }
        var label2 = entity[facets[1].code + 'Label'] || { value: 'none' }

        if (checkDuplicate[label1.value][label2.value].has(entity.entity.value)) {
          return
        }

        checkDuplicate[label1.value][label2.value].add(entity.entity.value)
        result[label1.value][label2.value].push(entity)

        // add amount on key1
        if (!checkDuplicate[label1.value]['null'].has(entity.entity.value)) {
          checkDuplicate[label1.value]['null'].add(entity.entity.value)
          result_amount[label1.value] = (result_amount[label1.value] || 0) + 1
        }
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
        sort_key2 = sort_key2.slice(0, limits[1])
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

      sort_key1 = sort_key1.slice(0, limits[0])
      this.$data.f1v = sort_key1.map(e => e.key)

      tmp = tmp.filter(e => this.$data.f1v.includes(e.key1)
              ).sort((a, b) => b.amt - a.amt
              ).map(e => e.key1 + "-" + e.key2)

      this.$data.insights.top = tmp.slice(0, 3)
      this.$data.insights.bottom = tmp.slice(-3).reverse()

      return result
    },
    d3filter (facets, limits, entities) {
      var checkDuplicate = {}
      var facetValues = []
      var result = {}

      for (var i = 1; i <= 3; i++) {
        facetValues[i] = []
      }

      entities.forEach((entity) => {
        for (var i = 1; i <= 3; i++) {
          if (entity[facets[i-1].code + 'Label']) {
            facetValues[i].push(entity[facets[i-1].code + 'Label'].value)
          }
        }
      })
      // console.log(facetValues)

      var resultAmount = {}
      for (var i = 1; i <= 3; i++) {
        facetValues[i].push('none')
        facetValues[i] = new Set(facetValues[i])
      }

      facetValues[1].forEach((facet1) => {
        result[facet1] = {}
        checkDuplicate[facet1] = {}
        checkDuplicate[facet1]['null'] = new Set()

        facetValues[2].forEach((facet2) => {
          result[facet1][facet2] = {}
          checkDuplicate[facet1][facet2] = {}
          checkDuplicate[facet1][facet2]['null'] = new Set()

          facetValues[3].forEach((facet3) => {
            result[facet1][facet2][facet3] = []
            checkDuplicate[facet1][facet2][facet3] = new Set()
          })
        })
      })

      entities.forEach((entity) => {
        var facet1 = entity[facets[0].code + 'Label'] || { value: 'none' }
        var facet2 = entity[facets[1].code + 'Label'] || { value: 'none' }
        var facet3 = entity[facets[2].code + 'Label'] || { value: 'none' }

        if (checkDuplicate[facet1.value][facet2.value][facet3.value].has(entity.entity.value)) {
          return
        }
        checkDuplicate[facet1.value][facet2.value][facet3.value].add(entity.entity.value)
        result[facet1.value][facet2.value][facet3.value].push(entity)

        if (checkDuplicate[facet1.value][facet2.value]['null'].has(entity.entity.value)) {
          return
        }
        checkDuplicate[facet1.value][facet2.value]['null'].add(entity.entity.value)
        resultAmount[facet1.value+facet2.value] = (resultAmount[facet1.value+facet2.value] || 0) + 1

        if (checkDuplicate[facet1.value]['null'].has(entity.entity.value)) {
          return
        }
        checkDuplicate[facet1.value]['null'].add(entity.entity.value)
        resultAmount[facet1.value] = (resultAmount[facet1.value] || 0) + 1
      })

      if (!this.$data.enableNone){
        for (var i = 1; i <= 3; i++) {
          facetValues[i].delete('none')
        }
      }

      var facetFilter1 = []
      var cumulativeAmounts = []
      facetValues[1].forEach((facet1) => {
        var facetFilter2 = []
        this.$data.d3f2vv[facet1] = {}
        facetValues[2].forEach((facet2) => {
          var facetFilter3 = []
          facetValues[3].forEach((facet3) => {
            facetFilter3.push({
              'key': facet3,
              'amt': result[facet1][facet2][facet3].length
            })
            cumulativeAmounts.push({
              'key': `${facet1}-${facet2}-${facet3}`,
              'amt': result[facet1][facet2][facet3].length
            })
            this.$data.amount[`${facet1}-${facet2}-${facet3}`] = result[facet1][facet2][facet3].length
          })
          facetFilter3.sort((a, b) => {
            return (b.amt - a.amt) * this.$data.selectSorting[2].value
          })
          facetFilter3 = facetFilter3.slice(0, limits[2])
          this.$data.d3f2vv[facet1][facet2] = facetFilter3.map(e => e.key)
          var facetFilter2Length = facetFilter3.reduce((acc, facet) => acc + facet.amt, 0)
          facetFilter2.push({
            'key': facet2,
            'amt': facetFilter2Length
          })
          this.$data.amount[`${facet1}-${facet2}`] = facetFilter2Length
        })
        facetFilter2.sort((a, b) => {
          return (b.amt - a.amt) * this.$data.selectSorting[1].value
        })
        facetFilter2 = facetFilter2.slice(0, limits[1])
        this.$data.d3f1v[facet1] = facetFilter2.map(e => e.key)
        facetFilter1.push({
          'key': facet1,
          'amt': facetFilter2.reduce((acc, facet) => acc + facet.amt, 0)
        })
      })
      facetFilter1.sort((a, b) => {
        return (b.amt - a.amt) * this.$data.selectSorting[0].value
      })
      facetFilter1 = facetFilter1.slice(0, limits[0])
      if (!this.$data.layerValues[0] || this.$data.layerValues[0].key != facetFilter1[0].key) {
        this.$data.layer = facetFilter1[0].key
      }
      this.$data.layerValues = facetFilter1

      cumulativeAmounts = cumulativeAmounts.sort((a, b) => b.amt - a.amt
              ).map(e => e.key)

      this.$data.insights.top = cumulativeAmounts.slice(0, 3)
      this.$data.insights.bottom = cumulativeAmounts.slice(-3).reverse()

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
      this.$data.insights.completenessScore = []

      this.$data.f1v.forEach((value1) => {
        if (typeof dataset[value1] == 'undefined') {
          return
        }
        var chartData = {
          labels: this.attributeNames,
          datasets: []
        }

        var completenessScore = 0
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
          var percentage = Number.parseFloat(sum / size * 100)
          // console.log(value1, value2, attribute, percentage)
          this.$data.insights[attribute].values.push({
            name: value1,
            facet1: value1,
            value: percentage
          })
          data.push(percentage.toFixed(2))
          completenessScore += percentage
        })

        completenessScore /= this.attributeCodes.length

        this.$data.insights.completenessScore.push({
          name: value1,
          score: completenessScore
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

      this.$data.insights.completenessScore.sort((a,b) => b.score - a.score)

      this.$data.insights.completenessScore.high = this.$data.insights.completenessScore.slice(0, 3)
      this.$data.insights.completenessScore.low = this.$data.insights.completenessScore.slice(-3).reverse()
    },
    d2Processing (dataset) {
      this.$data.insights.completenessScore = []

      this.$data.f1v.forEach((value1) => {

        this.$data.f2vv[value1].forEach((value2) => {
          if (typeof dataset[value1][value2] == 'undefined') {
            return
          }
          var chartData = {
            labels: this.attributeNames,
            datasets: []
          }

          var completenessScore = 0
          var data = []
          var subset = dataset[value1][value2]
          var size = subset.length

          this.$data.amount[value1 + "-" + value2] = size

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
            var percentage = Number.parseFloat(sum / size * 100)

            completenessScore += percentage

            this.$data.insights[attribute].values.push({
              name: value1 + "-" + value2,
              facet1: value1,
              facet2: value2,
              value: percentage
            })
            data.push(percentage.toFixed(2))
          })

          completenessScore /= this.attributeCodes.length

          this.$data.insights.completenessScore.push({
            name: value1 + "-" + value2,
            score: completenessScore
          })

          chartData.datasets.push({
            label: 'Average Completeness',
            backgroundColor: '#41b883',
            data: data
          })

          this.$nextTick(() => {
            const ctx = document.getElementById(`${value1}-${value2}`)
            if (ctx) {
              this.createChart(`${value1}-${value2}`, chartData)
            }
          })
        })
      })

      this.$data.insights.completenessScore.sort((a,b) => b.score - a.score)

      this.$data.insights.completenessScore.high = this.$data.insights.completenessScore.slice(0, 3)
      this.$data.insights.completenessScore.low = this.$data.insights.completenessScore.slice(-3).reverse()
    },
    d3Processing (dataset) {
      this.$forceUpdate()
      this.$data.insights.completenessScore = []
      // console.log(this.$data.d3f1v)
      // console.log(this.$data.layer)

      this.$data.layerValues.forEach((layer) => {
        this.$data.d3f1v[layer.key].forEach((value1) => {
          this.$data.d3f2vv[layer.key][value1].forEach((value2) => {
            if (typeof dataset[layer.key][value1][value2] == 'undefined') {
              return
            }
            var chartData = {
              labels: this.attributeNames,
              datasets: []
            }

            var completenessScore = 0
            var data = []
            var subset = dataset[layer.key][value1][value2]
            var size = subset.length

            this.$data.amount[`${layer.key}-${value1}-${value2}`] = size

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
              var percentage = Number.parseFloat(sum / size * 100)

              completenessScore += percentage

              this.$data.insights[attribute].values.push({
                name: `${layer.key}-${value1}-${value2}`,
                facet1: value1,
                facet2: value2,
                value: percentage
              })
              data.push(percentage.toFixed(2))
            })

            completenessScore /= this.attributeCodes.length

            this.$data.insights.completenessScore.push({
              name: `${layer.key}-${value1}-${value2}`,
              score: completenessScore
            })

            chartData.datasets.push({
              label: 'Average Completeness',
              backgroundColor: '#41b883',
              data: data
            })

            this.$nextTick(() => {
              const ctx = document.getElementById(`${layer.key}-${value1}-${value2}`)
              // console.log(`${layer.key}-${value1}-${value2}`)
              // console.log(ctx)
              // console.log(chartData)
              if (ctx && layer.key == this.$data.layer) {
                this.createChart3D(this.$data.layerValues, [layer.key,value1,value2], chartData)
              }
            })
          })
      })
      })

      this.$data.insights.completenessScore.sort((a,b) => b.score - a.score)

      this.$data.insights.completenessScore.high = this.$data.insights.completenessScore.slice(0, 3)
      this.$data.insights.completenessScore.low = this.$data.insights.completenessScore.slice(-3).reverse()
    },
    createChart3D (layers, facets, chartData) {
      layers.forEach(layer => {
        if (window[`${layer.key}-${facets[1]}-${facets[2]}-chart`] != undefined) {
          window[`${layer.key}-${facets[1]}-${facets[2]}-chart`].destroy()
        }
      })

      const ctx = document.getElementById(`${facets[0]}-${facets[1]}-${facets[2]}`).getContext('2d')
      window[`${facets[0]}-${facets[1]}-${facets[2]}-chart`] = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: this.$data.options,
      })
    },
    createChart (chartId, chartData) {
      const ctx = document.getElementById(chartId).getContext('2d')
      if (window[`${chartId}-chart`] != undefined) {
        console.log(window[`${chartId}-chart`])
        window[`${chartId}-chart`].destroy()
      }
      window[`${chartId}-chart`] = new Chart(ctx, {
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
      if (this.$data.dimension == 3) {
        dataset = this.d3filter( this.$data.selectedFacet,
                            this.$data.facetLimit,
                            entities)
      } else if (this.$data.dimension == 2) {
        dataset = this.d2filter( this.$data.selectedFacet,
                            this.$data.facetLimit,
                            entities)
      } else if (this.$data.dimension == 1) {
        dataset = this.d1filter( this.$data.selectedFacet,
                            this.$data.facetLimit,
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

      if (this.$data.dimension == 3) {
        this.d3Processing(dataset)
      } else if (this.$data.dimension == 2) {
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
          var half = parseInt(len / 2)
          var halfBound = half
          var q1Value = 0
          var q3Value = 0
          if (len % 2 == 1) {
            half += 1
          }

          if (halfBound % 2 == 0) {
            var a = this.$data.insights[attr.code].values[parseInt(halfBound / 2)].value
            var b = this.$data.insights[attr.code].values[parseInt(halfBound / 2) - 1].value
            q1Value = (a + b) / 2

            var c = this.$data.insights[attr.code].values[halfBound + parseInt(halfBound / 2)].value
            var d = this.$data.insights[attr.code].values[halfBound + parseInt(halfBound / 2) - 1].value
            q3Value = (c + d) / 2
          } else {
            q1Value = this.$data.insights[attr.code].values[parseInt(halfBound / 2)].value
            q3Value = this.$data.insights[attr.code].values[halfBound + parseInt(halfBound / 2)].value
          }

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
                name: entry.name,
                attr: attr.name,
                code: attr.code,
                value: entry.value
              })
            } else if (entry.value < bottom) {
              this.$data.insights.abnormalValues.low.push({
                name: entry.name,
                attr: attr.name,
                code: attr.code,
                value: entry.value
              })
            }
          })

          this.$data.insights[attr.code].values.sort((a,b) => a.value - b.value)

          if (this.$data.dimension == 2 || this.$data.dimension == 3) {
            this.$data.insights[attr.code].avg = this.$data.insights[attr.code].values.reduce((acc, e) => acc + parseFloat(e.value), 0) / this.$data.insights[attr.code].values.length
            this.$data.insights[attr.code].least = this.$data.insights[attr.code].values[0]
            this.$data.insights[attr.code].most = this.$data.insights[attr.code].values[this.$data.insights[attr.code].values.length-1]
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

      }

      // console.log("check")
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
          // console.log("check2")

          this.loading = false
        })
        .catch((error) => {
          console.log(error)

          this.loading = false

          alert(error)
        })
    },
    truncateString (len) {
      return str => {
        return str.length > len ? str.substring(0, len - 3) + "..." : str.substring(0, len)
      }
    }
  },
  watch: {
    dimension: function (newDimesion, oldDimension) {
      this.processVisualisation(this.entities)
    },
    layer: function (newLayer, oldLayer) {
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
