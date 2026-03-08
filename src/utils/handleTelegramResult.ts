import { StopProcessingError } from "../errors/telegramErrors.js";
import type { SendTextResult, TelegramEditResult, TelegramMiscResult, TelegramResult, TelegramSendResult } from "../types/telegramResults.js"
import handleTelegramSendResult, { handleSendTextResult } from "./handleTelegramSendResult.js";
import handleTelegramEditResult from "./handleTelegramEditResult.js";
import handleTelegramMiscResult from "./handleTelegramMiscResult.js";

async function handleTelegramResult(result: TelegramResult|TelegramResult[], context: any) {
    if (Array.isArray(result)) {
        for (const r of result) {
            await handleTelegramResult(r, context);
        }
        return;
    }
    switch (result.action) {
        case "send":
            await handleTelegramSendResult(result as TelegramSendResult, context);
            break;
        case "edit":
            await handleTelegramEditResult(result as TelegramEditResult, context);
            break;
        case "misc":
            await handleTelegramMiscResult(result as TelegramMiscResult, context);
            break;
    }   
    if (result.shouldStop) {
        console.log("Result indicates to stop further processing.");
        throw new StopProcessingError("Processing stopped by result instruction.");
    }
}

function getSendToInfo(result: TelegramResult, context: any) {
    const chatId = result.chatId || context.chatId;
    const threadId = result.threadId || context.msg?.message_thread_id;
    if (!chatId) {
        throw new Error("No chatId specified in result or context.");
    }
    return { chatId, threadId };
}
export default handleTelegramResult;

export {
    getSendToInfo
}