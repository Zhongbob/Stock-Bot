import type { Quote } from "yahoo-finance2/modules/quote";
import yahooFinance from "../lib/yahooFinance.js"
import type { ImageResult, SendTextResult } from "../types/telegramResults.js"
import type { ChartOptionsWithReturnArray, ChartResultArray } from "yahoo-finance2/modules/chart";
import chartJSNodeCanvas, {defaultConfiguration} from "../lib/chartJsNodeCanvas.js"
import fs from "fs"
import type { ChartConfiguration } from "chart.js";

const DetailsService: {
    getStockChart: (symbol: string,
        range?: {
        startDate: Date,
        endDate: Date,
        interval?: "5m" | "15m" | "1h" | "1d"
    }) => Promise<ImageResult>,
    getStockQuote: (symbol: string) => Promise<SendTextResult>;
    _formatYahooQuoteMarkdown: (data: Quote) => string;
    _createChart: (symbol: string, data: ChartResultArray) => Promise<Buffer>;
} = {
    _formatYahooQuoteMarkdown: function(data: Quote): string {
        const name = data.longName || data.shortName || data.symbol
        const currency = data.currency || ""
        const exchange = data.fullExchangeName || ""
        const state = data.marketState || ""

        const price = data.regularMarketPrice
        const change = data.regularMarketChange
        const changePercent = data.regularMarketChangePercent

        const isUp = change !== undefined && change >= 0
        const arrow = change === undefined ? "" : isUp ? "📈" : "📉"
        const sign = change !== undefined && change >= 0 ? "+" : ""

        const safe = (n?: number, digits = 2) =>
            n !== undefined ? n.toFixed(digits) : "N/A"

        const safeInt = (n?: number) =>
            n !== undefined ? n.toLocaleString() : "N/A"

  return `
**${name}** (${data.symbol})
_**${data.typeDisp || data.quoteType || ""} | ${exchange} | ${state}**_

${arrow} **Price:** ${currency} ${safe(price)}
Change: ${sign}${safe(change)} (${sign}${safe(changePercent)}%)

**Day Range:** ${safe(data.regularMarketDayLow)} - ${safe(data.regularMarketDayHigh)}
Open: ${safe(data.regularMarketOpen)}
Prev Close: ${safe(data.regularMarketPreviousClose)}

**52W Range:** ${safe(data.fiftyTwoWeekLow)} - ${safe(data.fiftyTwoWeekHigh)}

**Moving Averages**
50D: ${safe(data.fiftyDayAverage)}
200D: ${safe(data.twoHundredDayAverage)}

Volume: ${safeInt(data.regularMarketVolume)}
`.trim()
},
    _createChart: async function (symbol: string, data: ChartResultArray) {
        const configuration: ChartConfiguration = { 
            ...defaultConfiguration,
            data: {
                datasets: [{
                    label: `${symbol} Price`,
                    data: data.quotes.map(point => ({
                        x: point.date.valueOf(),
                        o: point.open,
                        h: point.close,
                        l: point.open,
                        c: point.close
                    })),
                }]
            }
        }
        const buffer = await chartJSNodeCanvas.renderToBuffer(configuration)
        return buffer
    },
    getStockQuote: async (symbol: string) => {
        const data = await yahooFinance.quote(symbol)
        // const getQuoteText = (markdown = true) => SearchService._yahooSummaryToText(data, markdown)
        return {
            type: "text",
            data: data,
            shouldStop: data ? false : true, // If no data returned, signal to stop further processing and suggest user to check symbol
            text: () => DetailsService._formatYahooQuoteMarkdown(data)
        }
    },
    getStockChart: async (symbol: string, range?: {
        startDate: Date,
        endDate: Date,
        interval?: "5m" | "15m" | "1h" | "1d"
    }) => {
        if (!range) {
            const stockDetails = await DetailsService.getStockQuote(symbol)
            const postMarketTime = stockDetails.data?.postMarketTime ?? new Date()
            
            range = {
                startDate: new Date(postMarketTime.valueOf() - 24 * 60 * 60 * 1000), 
                endDate: postMarketTime,
                interval: "5m"
            }
        }
        if (!range.interval) {
            range.interval = "5m"
        }
        const options: ChartOptionsWithReturnArray = {
            period1: range.startDate,
            period2: range.endDate,
            interval: range.interval,
            return: "array"
        }
        let result 
        try {
            result = await yahooFinance.chart(symbol,options)
        } catch (error) {
            console.error("Error fetching chart data:", error)
            return {
                type: "text",
                text: () => `Failed to fetch chart data for ${symbol}. Please check the symbol and try again.`,
                shouldStop: true
            }
        }
        
        console.log("result",result)
        const suggestionText = `Here is the stock chart for ${symbol} from ${options.period1} to ${options.period2}.`
        const buffer = await DetailsService._createChart(symbol, result)
        return {
            type: "image",
            data: result,
            image: buffer,
            caption: suggestionText,
            shouldStop: false // Signal to continue processing and send the chart image once implemented
        }
    }
}

export default DetailsService;