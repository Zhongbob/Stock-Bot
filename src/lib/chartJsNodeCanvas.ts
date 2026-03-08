import { ChartJSNodeCanvas } from 'chartjs-node-canvas'
import "chartjs-adapter-luxon"
import type { ChartConfiguration } from 'chart.js'

const defaultConfiguration: ChartConfiguration = {
    type: 'candlestick',
    options: {
      
      responsive: false,
      scales: {
      x: {
        type: 'time',
        offset: false,
        bounds: "data",
        adapters: {
          date: {
            zone: 'utc' // optional
          }
        },
        time: {
          unit: 'day',
          tooltipFormat: 'DD T'
        }
      }
    },
      plugins: {
        legend: { display: true }
      }
    }
}

const width = 800
const height = 500
const chartJSNodeCanvas = new ChartJSNodeCanvas({ 
  width, 
  height,
  plugins: {
    globalVariableLegacy: [
      'chartjs-chart-financial',
      "chartjs-adapter-luxon"
    ]
  },
  chartCallback: (ChartJS) => {
    require('chartjs-chart-financial')
    require('chartjs-adapter-luxon')
    ChartJS.defaults.responsive = false
  }
 })


export default chartJSNodeCanvas
export {defaultConfiguration}