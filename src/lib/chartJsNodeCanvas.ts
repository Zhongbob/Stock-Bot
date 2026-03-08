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
            zone: 'GMT+8'
          }
        },
        time: {
          unit: 'minute',
        }
      }
    },
      plugins: {
        
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
    ],
    requireLegacy: [
      'chartjs-adapter-date-fns'
    ]
  }
 })


export default chartJSNodeCanvas
export {defaultConfiguration}