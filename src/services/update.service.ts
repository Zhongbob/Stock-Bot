import type { TrackedStock } from "@prisma/client";
import DetailsService from "./details.service.js";
import type { ImageResult, SendTextResult, WithEditAction, WithRequiredChatId } from "../types/telegramResults.js";
import { trackRepository } from "../repository/track.repository.js";
import TrackService from "./track.service.js";
import type { ChatInfo } from "../types/telegramTypes.js";

type UpdateResult = WithEditAction<SendTextResult> | WithEditAction<ImageResult> | WithRequiredChatId<SendTextResult> | WithRequiredChatId<ImageResult>;
const UpdateService: { 
    updateTracking: (record: TrackedStock) => Promise<UpdateResult[]>; 
    updateAllTrackings: (telegramGroupId?: number) => Promise<UpdateResult[][]>;
} = {
    updateTracking: async (record: TrackedStock) => {
        const chatInfo: ChatInfo = {
            chatId: record.telegramGroupId,
            threadId: record.threadId || undefined
        }
        const quote = await DetailsService.getStockQuote(record.symbol, chatInfo)
        const chart = await DetailsService.getStockChart(record.symbol, undefined, chatInfo)
        const returnValue: (UpdateResult)[] = []
        const currentTime = new Date()
        const dateOfUpdate = record.updatedAt ? record.updatedAt.getDate() : null
        const todayDate = currentTime.getDate()
        if (!record.detailMessageId || todayDate !== dateOfUpdate) {
            const quoteWithChatId: WithRequiredChatId<SendTextResult> = {
                ...quote,
                chatId: record.telegramGroupId,
                threadId: record.threadId
            }
            returnValue.push(quoteWithChatId)
        }
        else if (record.detailMessageId) {
            const quoteEditResult: WithEditAction<SendTextResult> = {
                ...quote,
                action: "edit",
                chatId: record.telegramGroupId,
                threadId: record.threadId!,
                messageId: record.detailMessageId,
            }
            returnValue.push(quoteEditResult)
        }
        if (record.chartMessageId && chart.type === "image") {
            const chartEditResult: WithEditAction<ImageResult> = {
                ...chart,
                action: "edit",
                chatId: record.telegramGroupId,
                threadId: record.threadId!,
                messageId: record.chartMessageId,
            }
            returnValue.push(chartEditResult)
        }
        return returnValue;
    },
    updateAllTrackings: async (telegramGroupId?: number) => {
        console.log("Updating all trackings...")
        const allTrackings = await TrackService.getAllTrackings(telegramGroupId);
        const results: UpdateResult[][] = []
        for (const tracking of allTrackings) {
            try{
                const trackingResults = await UpdateService.updateTracking(tracking);
                results.push(trackingResults);
            }
            catch (error) {
                console.error(`Failed to update tracking for symbol ${tracking.symbol} in chat ${tracking.telegramGroupId}:`, error);
            }
        }
        console.log(results)
        return results;
    }
}

export default UpdateService;