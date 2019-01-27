<template>
  <v-layout column align-center>
    <h1 class="ml-3 mb-3 pt-4"> {{profileName}} </h1>
    <div  v-for="f1value in f1values" v-bind:key=f1value>
      <v-flex xs12>
        <v-card>
          <v-card-title class="headline">{{f1value}}</v-card-title>
          <v-layout row>
            <v-flex xs4 v-for="f2value in f2values" v-bind:key=f2value>
              <v-card-title class="headline">{{f2value}} </v-card-title>
              <v-card-text :id="f1value + f2value + 'amount'">Amount of entities in this facet: </v-card-text>
              <canvas :id="f1value + f2value"></canvas>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </div>

  </v-layout>
</template>

<script>
import Chart from 'chart.js'
/* eslint-disable */

export default {
  name: 'App',
  async fetch ({ store }) {
    await Promise.all([
      store.dispatch('LANGUAGES'),
      store.dispatch('FETCH_PROFILE_BY_ID', 106)
    ])
  },
  data () {
      return {
        f1v: [],
        f2v: [],
        f3v: [],
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
            }]
          }
        },
        datacollection: {}
      }
  },
  computed: {
    entities () {
      var entities = JSON.parse(JSON.stringify(this.$store.state.entities1))
      // var attributes = JSON.parse(JSON.stringify(this.$store.state.attributes))

      // entities.forEach(function (entity) {
      //   entity.classLabel = entity.classLabel.value
      //   entity.score = (100 * (Object.keys(entity).length - 2) / attributes.length)
      // })

      return entities
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
      return this.$store.state.facets
    },
    attributes () {
      var entities = this.$store.state.entities1
      var attributes = this.$store.state.attributes
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
        return a.count - b.count
      })
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
    f1values () {
      return Array.from(this.$data.f1v)
    },
    f2values () {
      return Array.from(this.$data.f2v)
    }
  },
  methods: {
    f (f1, f2, entities) {
      var f1s = []
      var f2s = []
      var result = {}

      entities.forEach((entity) => {
        if (entity[f1 + 'Label']) {
          f1s.push(entity[f1 + 'Label'].value)
        }
        if (entity[f2 + 'Label']) {
          f2s.push(entity[f2 + 'Label'].value)
        }
      })
      f1s.push('none')
      f2s.push('none')

      f1s = new Set(f1s)
      f2s = new Set(f2s)

      this.$data.f1v = Array.from(f1s)
      this.$data.f2v = Array.from(f2s)

      f1s.forEach((elem1) => {
        result[elem1] = {}
        f2s.forEach((elem2) => {
          result[elem1][elem2] = []
        })
      })

      entities.forEach((entity) => {
        var label1 = entity[f1 + 'Label'] || { value: 'none' }
        var label2 = entity[f2 + 'Label'] || { value: 'none' }

        result[label1.value][label2.value].push(entity)
      })

      return result
    },
    createChart (chartId, chartData) {
      const ctx = document.getElementById(chartId)
      // console.log(ctx)
      new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: this.$data.options,
      })
    },
    postQuery () {
      this.loading = true

      var query = `
        SELECT ?entity ?entityLabel ?p69Label ?p102Label ?p21Label ?p19Label ?p1412Label
        WHERE {
          ?entity wdt:P31 wd:Q5.
          ?entity wdt:P106 wd:Q82955.
          ?entity wdt:P27 wd:Q252.
          OPTIONAL {?entity wdt:P69 ?p69}
          OPTIONAL {?entity wdt:P102 ?p102}
          OPTIONAL {?entity wdt:P21 ?p21}
          OPTIONAL {?entity wdt:P19 ?p19}
          OPTIONAL {?entity wdt:P1412 ?p1412}
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
      `

      this.$axios.post('https://query.wikidata.org/sparql?query=' + encodeURIComponent(query))
        .then((response) => {
          var entities = response.data.results.bindings
          console.log('================================LOLOLOLOLOL')
          this.$store.commit('SET_ENTITIES1', entities)

          entities.forEach((entity) => {
            var exist = Object.keys(entity).length - 2
            entity.score = (exist / 5) * 100
          })

          var dataset = this.f('p102', 'p21', entities)
          console.log(dataset)
          var attributes = ['p1412', 'p69', 'p19']

          this.$data.f1v.forEach((value1) => {
            this.$data.datacollection[value1] = {}
            this.$data.f2v.forEach((value2) => {
              if (typeof dataset[value1][value2] == 'undefined') {
                return
              }
              var chartData = {
                labels: attributes,
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
                data.push(sum / size * 100)
              })

              // console.log(data)
              chartData.datasets.push({
                label: 'Average Completeness',
                backgroundColor: '#41b883',
                data: data
              })

              // console.log(JSON.stringify(chartData))
              this.$nextTick(() => {
                const ctx = document.getElementById(value1 + value2 + 'amount')
                ctx.innerText = ctx.innerText + size
                this.createChart(value1 + value2, chartData)
              })
            })
          })

          this.loading = false
          // this.warning = (this.entities.length === 20000)
        })
        .catch((error) => {
          console.log(error)
        })
    }
  },
  mounted: function () {
    this.postQuery()
    // this.$forceUpdate()
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
</style>
