import type { CreateThreadResult, ImageResult, SendTextResult } from "../types/telegramResults.js";
import SearchService from "./search.service.js";
import DetailsService from "./details.service.js";
import { trackRepository } from "../repository/track.repository.js";
import type { ChatInfo } from "../types/telegramTypes.js";
import type { TrackedStock } from "@prisma/client";
const TrackService: {
    trackStock: (symbol: string, chatInfo: ChatInfo) => Promise<(CreateThreadResult | SendTextResult | ImageResult)[]>;
    getAllTrackings: (telegramGroupId?: number) => Promise<TrackedStock[]>;
    _symbolNotFoundResult: (symbol: string) => Promise<SendTextResult>;
    _sendTrackingConfirmation: (symbol: string, threadId?: number) => SendTextResult;
    _trackExistsResult: (symbol: string) => SendTextResult;
} = {
    _symbolNotFoundResult: async function(symbol: string): Promise<SendTextResult> {
        const searchResults = await SearchService.searchByKeyword(symbol)
        const suggestionText = searchResults.raw?.primary?.symbol
            ? `Symbol "${symbol}" not found. Did you mean "${searchResults.raw.primary.symbol}"?`
            : `Symbol "${symbol}" not found and no close matches were found. Please check the symbol and try again.`
        return {
            type: "text",
            action: "send",
            text: () => suggestionText,
            shouldStop: true
        }
        
    },
    _sendTrackingConfirmation: function(symbol: string, threadId?: number): SendTextResult {
        const text = threadId
            ? `Symbol "${symbol}" is now being tracked in the current thread.`
            : `Symbol "${symbol}" is now being tracked!`;
        return {
            type: "text",
            action: "send",
            text: () => text
        }
    },
    _trackExistsResult: function(symbol: string): SendTextResult {
        return {
            type: "text",
            action: "send",
            text: () => `Symbol "${symbol}" is already being tracked in this group.`
        }
    },
    trackStock: async function(symbol: string, chatInfo: ChatInfo){
        const { chatId, threadId } = chatInfo;
        // Create tracking record in database (not implemented yet)

        const quote = await DetailsService.getStockQuote(symbol, chatInfo) // Verify Symbol Exists
        // For now, just return a successful thread creation result
        if (quote.shouldStop) {
            // If quote lookup failed, stop further processing and suggest user to check symbol
            return [await TrackService._symbolNotFoundResult(symbol)]
        }
        
        const existingTracking = await trackRepository.findBySymbol(chatId, symbol)
        if (existingTracking.length && !threadId) {
            // Only create tracking record if the symbol has not been tracked before, 
            // Otherwise just update the threadId for the existing record (to handle the case when user tries to track a symbol that's already being tracked but without providing threadId)
            return [TrackService._trackExistsResult(symbol)]
        }
        
        const chart = await DetailsService.getStockChart(symbol, undefined, chatInfo) // Get chart with onSent handler to update tracking record with chartTrackingId once sent

        if (threadId) {
            await trackRepository.create(chatId, symbol, threadId);
            // If threadId is provided, means no need to create new thread, just update the tracking record with the threadId
            return [TrackService._sendTrackingConfirmation(symbol, threadId), quote,chart];
        }

        // If not threadId provided, proceed to create a new thread and 
        // update the tracking record with the new threadId once created
        
        
        const onThreadCreate = async (threadId: number) => {
            console.log("Thread created with id", threadId, "for symbol", symbol, "in chat", chatId)
            await trackRepository.create(chatId, symbol, threadId);
        }
        return [
            {
                type: "createThread",
                action: "misc",
                threadName: `${symbol}`,
                shouldStop: false, 
                onThreadCreated: onThreadCreate,
                onThreadExists: onThreadCreate // For simplicity, treat thread exists case the same as thread created case and just update the tracking record with the existing threadId
            },
            TrackService._sendTrackingConfirmation(symbol),
            quote,
            chart,
        ]     
    },
    getAllTrackings: async (telegramGroupId?: number) => {
        return await trackRepository.findAll(telegramGroupId);
    }
}


export default TrackService;