<template>
  <v-layout column justify-center align-center>
    <h1 class="ml-3 mb-3 pt-4"> {{profileName}} </h1>
    <!-- <div  v-for="f1value in f1values" v-bind:key=f1value>
      <v-flex xs12>
        <v-card>
          <v-card-title class="headline">{{f1value}}</v-card-title>
          <v-layout row>
            <v-flex xs4 v-for="f2value in f2values" v-bind:key=f2value>
              <v-card-title class="headline">{{f2value}} </v-card-title>
              <v-card-text>Amount of entities according to completeness score</v-card-text>
              <BarChart :chart-data="datacollection" :options="chartOptions"/>
            </v-flex>
            <canvas id="chart1"></canvas>
            <canvas id="chart2"></canvas>
          </v-layout>
        </v-card>
      </v-flex>
    </div> -->
    <canvas id="chart1"></canvas>
    <canvas id="chart2"></canvas>
    <!-- {{ datacollection }} -->
    <v-btn @click="createChart('chart1')" color="success"> 1 </v-btn>
    <v-btn @click="createChart('chart2')" color="info"> 2 </v-btn>

  </v-layout>
</template>

<script>
import Chart from 'chart.js'

export default {
  name: 'App',
  data () {
      return {
        profileName: 'Politician - ID',
        options: {
          responsive: true,
          lineTension: 1,
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                padding: 25,
              }
            }]
          }
        },
        chartData: {
          labels: ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'],
          datasets: [
            { // one line graph
              label: 'Number of Moons',
              data: [0, 0, 1, 2, 67, 62, 27, 14],
              backgroundColor: [
                'rgba(54,73,93,.5)', // Blue
                'rgba(54,73,93,.5)',
                'rgba(54,73,93,.5)',
                'rgba(54,73,93,.5)',
                'rgba(54,73,93,.5)',
                'rgba(54,73,93,.5)',
                'rgba(54,73,93,.5)',
                'rgba(54,73,93,.5)'
              ],
              borderColor: [
                '#36495d',
                '#36495d',
                '#36495d',
                '#36495d',
                '#36495d',
                '#36495d',
                '#36495d',
                '#36495d',
              ],
              borderWidth: 3
            },
            { // another line graph
              label: 'Planet Mass (x1,000 km)',
              data: [4.8, 12.1, 12.7, 6.7, 139.8, 116.4, 50.7, 49.2],
              backgroundColor: [
                'rgba(71, 183,132,.5)', // Green
              ],
              borderColor: [
                '#47b784',
              ],
              borderWidth: 3
            }
          ]
        }
      }
  },
  methods: {
    createChart (chartId) {
      const ctx = document.getElementById(chartId);
      new Chart(ctx, {
        type: 'line',
        data: this.$data.chartData,
        options: this.$data.options,
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
</style>
