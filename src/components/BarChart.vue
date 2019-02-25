<script>
import { Bar, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: Bar,
  mixins: [reactiveProp],
  props: ['chartData', 'options'],
  computed: {
    data: function () {
      return this.chartData
    }
  },
  mounted () {
    this.renderChart(this.data, this.options)
  }
}
</script>
