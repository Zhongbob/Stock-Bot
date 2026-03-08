import { ChartJSNodeCanvas } from 'chartjs-node-canvas'
import type { ChartConfiguration, Chart } from 'chart.js'
import { registerFont } from "canvas"
registerFont('./src/assets/Roboto.ttf', { family: 'Roboto' })
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
      'chartjs-adapter-date-fns'
    ]
  },
  chartCallback: (ChartJS) => {
    ChartJS.defaults.font.family = "Roboto"
  }
 })


export default chartJSNodeCanvas
export {defaultConfiguration}