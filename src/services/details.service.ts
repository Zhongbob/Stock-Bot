import type { Quote } from "yahoo-finance2/modules/quote";
import yahooFinance from "../lib/yahooFinance.js"
import type { ImageResult, SendTextResult } from "../types/telegramResults.js"
import type { ChartOptionsWithReturnArray, ChartResultArray } from "yahoo-finance2/modules/chart";
import chartJSNodeCanvas, {defaultConfiguration} from "../lib/chartJsNodeCanvas.js"
import type { ChartConfiguration } from "chart.js";
import { trackRepository } from "../repository/track.repository.js";
import type { ChatInfo } from "../types/telegramTypes.js";
import type { Message } from "node-telegram-bot-api";


const DetailsService: {
    getStockChart: (symbol: string,
        range?: {
        startDate: Date,
        endDate: Date,
        interval?: "5m" | "15m" | "1h" | "1d"
    }, sendTo?: ChatInfo) => Promise<ImageResult|SendTextResult>;
    getStockQuote: (symbol: string, sendTo?: ChatInfo) => Promise<SendTextResult>;
    _formatYahooQuoteMarkdown: (data: Quote) => string;
    _createChart: (symbol: string, data: ChartResultArray, endDate?: Date) => Promise<Buffer>;
    _createOnSentMessageHandler: (type: "detail"|"chart", symbol: string) => (message: Message) => Promise<void>;
} = {
    /**
     * Creates an `onMessageSent` handler for chart or detail messages.
     *
     * The generated handler receives the sent Telegram `messageId` and updates
     * the tracked stock's `chartTrackingId` via `trackRepository.updateTrackingId`.
     */
    _createOnSentMessageHandler: function(type: "detail"|"chart", symbol: string) {
        return async function(message: Message) {
            const sendTo = {
                chatId: message.chat.id,
                threadId: message.message_thread_id
            }
            await trackRepository.updateTrackingId(type, symbol, sendTo, message.message_id)
        }
    },
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
Last Updated: ${(new Date()).toLocaleString()}

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
    _createChart: async function (symbol: string, data: ChartResultArray, endDate: Date = new Date()): Promise<Buffer> {
        data.quotes = data.quotes.filter(quote => quote.open !== null && quote.close !== null)
        const configuration: ChartConfiguration = { 
            ...defaultConfiguration,
            options: {
                ...defaultConfiguration.options,
                scales: {
                    ...defaultConfiguration.options?.scales,
                    x: {
                        ...defaultConfiguration.options?.scales?.x,
                        max: endDate.valueOf()
                    }
                }
            },
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
    /**
     * Fetches and formats a stock quote message.
     *
     * If `sendTo` is provided, the returned result includes an `onMessageSent`
     * handler that updates the quote `trackingMessageId` (`detailTrackingId`) once
     * Telegram returns the sent `messageId`.
     */
    getStockQuote: async (symbol: string, sendTo?: {chatId: number, threadId?: number | undefined}) => {
        const data = await yahooFinance.quote(symbol)
        // const getQuoteText = (markdown = true) => SearchService._yahooSummaryToText(data, markdown)
        return {
            type: "text",
            action: "send",
            data: data,
            shouldStop: data ? false : true, // If no data returned, signal to stop further processing and suggest user to check symbol
            text: () => DetailsService._formatYahooQuoteMarkdown(data),
            ...(sendTo ? { onMessageSent: DetailsService._createOnSentMessageHandler("detail", symbol) } : undefined)
        }
    },
    /**
     * Fetches stock chart data and returns a chart image message.
     *
     * If `sendTo` is provided, the returned result includes an `onMessageSent`
     * handler that updates the chart `trackingMessageId` (`chartTrackingId`) once
     * Telegram returns the sent `messageId`.
     */
    getStockChart: async (symbol: string, range?: {
        startDate: Date,
        endDate: Date,
        interval?: "5m" | "15m" | "1h" | "1d"
    }, sendTo?: {chatId: number, threadId?: number | undefined}) => {
        if (!range) {
            const stockDetails = await DetailsService.getStockQuote(symbol)
            const postMarketTime = stockDetails.data?.postMarketTime ?? new Date()
            const startOfDay = new Date(postMarketTime).setHours(0, 0, 0, 0)
            range = {
                startDate: new Date(startOfDay), 
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
            console.log("Chart for symbol", symbol, "not found with options", options)
            return {
                type: "text",
                action: "send",
                text: () => `Failed to fetch chart data for ${symbol}. Please check the symbol and try again.`,
                shouldStop: true
            }
        }
        const endOfDay = new Date(range.endDate).setHours(23, 59, 59, 999)
        const suggestionText = `Here is the stock chart for ${symbol} from ${new Date(options.period1).toLocaleString()} to ${new Date(options.period2!).toLocaleString()}.`
        const buffer = await DetailsService._createChart(symbol, result, new Date(endOfDay))
        return {
            type: "image",
            action: "send",
            data: result,
            image: buffer,
            caption: suggestionText,
            shouldStop: false, // Signal to continue processing and send the chart image once implemented
            ...(sendTo ? { onMessageSent: DetailsService._createOnSentMessageHandler("chart", symbol) } : undefined)
        }
    }
}

export default DetailsService;