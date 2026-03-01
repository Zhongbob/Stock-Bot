import type { TrackedStock } from "@prisma/client";
import DetailsService from "./details.service.js";
import type { ImageEditResult, TelegramEditResult, TextEditResult } from "../types/telegramEditResult.js";

const UpdateService: { 
    updateTracking: (record: TrackedStock) => Promise<(TextEditResult | ImageEditResult)[]>; 
} = {
    updateTracking: async (record: TrackedStock) => {
        const quote = await DetailsService.getStockQuote(record.symbol)
        const chart = await DetailsService.getStockChart(record.symbol)
        const returnValue = []
        const currentTime = new Date()
        const dateOfUpdate = record.updatedAt ? record.updatedAt.getDate() : null
        const todayDate = currentTime.getDate()
        if (!record.detailMessageId || todayDate !== dateOfUpdate) {
            returnValue.push(quote)
        }
        else if (record.detailMessageId) {
            const quoteEditResult: TextEditResult = {
                ...quote,
                chatId: record.telegramGroupId,
                threadId: record.threadId!,
                messageId: record.detailMessageId,
            }
            returnValue.push(quoteEditResult)
        }
        if (record.chartMessageId) {
            const chartEditResult = {
                ...chart,
                chatId: record.telegramGroupId,
                threadId: record.threadId!,
                messageId: record.chartMessageId,
            }
            returnValue.push(chartEditResult)
        }
        return returnValue;
    }
}