import { Chart, registerables } from 'chart.js'
import { CandlestickController, OhlcController, CandlestickElement, OhlcElement } from 'chartjs-chart-financial/dist/chartjs-chart-financial.esm.js'

// Chart.register(...registerables)
Chart.register(CandlestickController, OhlcController, CandlestickElement, OhlcElement)

const defaultConfiguration = {
    type: 'candlestick',
    options: {
      responsive: false,
      plugins: {
        legend: { display: false }
      }
    }
}

export default defaultConfiguration