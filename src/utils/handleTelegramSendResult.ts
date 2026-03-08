import telegramifyMarkdown from "telegramify-markdown";
import type { ImageResult, SendTextResult, TelegramSendResult, WithEditAction } from "../types/telegramResults.js";
import bot from "../lib/bot.js";
import { getSendToInfo } from "./handleTelegramResult.js";

async function handleTelegramSendResult(result: TelegramSendResult, context: any) {
    let message;
    try{
    switch (result.type) {
        case "text":
            message = await handleSendTextResult(result, context);
            break;
        case "image":
            message = await handleSendPhotoResult(result, context);
            break;
        default:
            console.warn("Unknown send result type:", result);
            return
    }
    if (result.onMessageSent && message) {
        await result.onMessageSent(message);
    }
    }
    catch (error) {
        console.error("Error handling send result:", error);
    }
}
async function handleSendPhotoResult(result: ImageResult|WithEditAction<ImageResult>, context: any) {
    const { chatId, threadId } = getSendToInfo(result, context);
    const message = await bot.sendPhoto(chatId, result.image, { caption: result.caption, message_thread_id: threadId });
    return message;
    
}
async function handleSendTextResult(result: SendTextResult, context: any) {
    const { chatId, threadId } = getSendToInfo(result, context);
    const text = telegramifyMarkdown(result.text!(true), "escape"); // Assuming text function is always provided for SendTextResult
    const message = await bot.sendMessage(chatId, text,
        { message_thread_id: threadId, parse_mode: "MarkdownV2" }
    );
    return message;
}

export default handleTelegramSendResult;
export {
    handleSendPhotoResult,
    handleSendTextResult
}