import { ChartJSNodeCanvas } from 'chartjs-node-canvas'
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
    ],
    requireChartJSLegacy: [
      "chartjs-adapter-luxon"     
    ],
    requireLegacy: [
      "chartjs-adapter-luxon" 
    ],
    modern: [
      "chartjs-adapter-luxon"
    ]
  },
  chartCallback: async (ChartJS) => {
    ChartJS.defaults.responsive = false
  }
 })


export default chartJSNodeCanvas
export {defaultConfiguration}