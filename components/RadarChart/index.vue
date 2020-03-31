<script>
import { Chart } from 'chart.js'
import { Radar } from 'vue-chartjs'

export default {
  extends: Radar,
  props: ['chartdata'],
  mounted () {
    Chart.defaults.global.defaultFontColor = '#333'
    Chart.defaults.global.defaultFontSize = 13

    this.renderChart(this.chartdata, {
      responsive: true,
      legend: {
        usePointStyle: true
      },
      tooltips: {
        enabled: true,
        callbacks: {
          label: function (tooltipItem, data) {
            return data.datasets[tooltipItem.datasetIndex].label + ' : ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]
          }
        }
      },
      scale: {
        pointLabels: {
          fontSize: 13
        },
        ticks: {
          beginAtZero: true,
          min: 1
        },
        gridLines: {
          circular: true
        }
      }
    })
  }
}
</script>

<style>
</style>
