import type { CreateThreadResult, SendTextResult } from "../types/telegramResults.js";
import SearchService from "./search.service.js";
const TrackService: {
    trackStock: (symbol: string, chatId: number) => Promise<CreateThreadResult| SendTextResult>;
} = {
    trackStock: async (symbol: string, chatId: number) => {
        // Create tracking record in database (not implemented yet)
        console.log(symbol)
        const quote = await SearchService.quoteBySymbol(symbol) // Verify Symbol Exists
        console.log(quote)
        // For now, just return a successful thread creation result
        if (quote.shouldStop) {
            // If quote lookup failed, stop further processing and suggest user to check symbol
            const searchResults = await SearchService.searchByKeyword(symbol)
            const suggestionText = searchResults.summary.primary.symbol
                ? `Symbol "${symbol}" not found. Did you mean "${searchResults.summary.primary.symbol}"?`
                : `Symbol "${symbol}" not found and no close matches were found. Please check the symbol and try again.`
            return {
                type: "text",
                text: () => suggestionText,
                shouldStop: true
            }
        }
        return {
            type: "createThread",
            threadName: `${symbol}`,
            shouldStop: false, 
            onThreadCreated: (threadId: number) => {},
            onThreadExists: (threadId: number) => {},
        }
    
        
    }
}


export default TrackService;