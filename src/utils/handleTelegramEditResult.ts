import bot from "../lib/bot.js";
import type { ImageResult, SendTextResult, TelegramEditResult, WithEditAction } from "../types/telegramResults.js";
import { getSendToInfo } from "./handleTelegramResult.js";
import telegramifyMarkdown from "telegramify-markdown";
import { handleSendPhotoResult } from "./handleTelegramSendResult.js";

async function handleTelegramEditResult(result: TelegramEditResult, context: any) {
    try {
        switch (result.type) {
        case "text":
            await handleTelegramEditTextResult(result, context);
            break;
        case "image":
            await handleTelegramEditPhotoResult(result, context);
            break;
        default:
            console.warn("Unknown edit result type:", result);
        }
    }
    catch (error) {
        if (error.body && error.error_code == 400) {
            console.log("No Change. Skipping edit.");
        }
        else if (error.body){
            console.error("Error editing message:", error.body.description);
        }
        else {
            console.error("Error editing message:", error);
        }
    }
}

async function handleTelegramEditTextResult(result: WithEditAction<SendTextResult>, context: any) {
    const { chatId } = getSendToInfo(result, context);
    const messageId = result.messageId;
    const text = telegramifyMarkdown(result.text!(true), "escape"); // Assuming text function is always provided for SendTextResult
    await bot.editMessageText(text, { 
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "MarkdownV2"
    });
}

async function handleTelegramEditPhotoResult(result: WithEditAction<ImageResult>, context: any) {
    const { chatId } = getSendToInfo(result, context);
    const messageId = result.messageId;
    try{
        await bot.deleteMessage(chatId, messageId);
    }
    catch (error) {
        console.error("Error deleting message before editing photo:", error);
    }
    const message = await handleSendPhotoResult(result, context);
    await result.onMessageSent?.(message);
}
export default handleTelegramEditResult;
export {
    handleTelegramEditTextResult,
    handleTelegramEditPhotoResult
}