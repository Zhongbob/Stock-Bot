import { StopProcessingError } from "../errors/telegramErrors.js";
import bot from "../lib/bot.js";
import type { CreateThreadResult, SendTextResult, TelegramResult } from "../types/telegramResults.js"

function handleTelegramResult(result: TelegramResult, context: any) {
    switch (result.type) {
        case "text":
            break
        case "createThread":
            handleCreateThreadResult(result, context);
            break;
        case "stop":
            console.log("Processing stopped. Reason:", result.reason || "No reason provided");
            throw new StopProcessingError(result.reason || "Processing stopped by result instruction.");
        default:
            console.warn("Unknown result type:", result.type);
    }
    if (result.text) {
        handleSendTextResult(result as SendTextResult, context);
    }
    if (result.shouldStop) {
        console.log("Result indicates to stop further processing.");
        throw new StopProcessingError("Processing stopped by result instruction.");
    }
}
function handleSendTextResult(result: SendTextResult, context: any) {
    const text = result.text!(true); // Assuming text function is always provided for SendTextResult
    console.log("Sending text message:", text);
    bot.sendMessage(context.chatId, text,
        { message_thread_id: context.threadId, parse_mode: "MarkdownV2" }
    );
}

async function handleCreateThreadResult(result: CreateThreadResult, context: any) {
    console.log(`Creating thread with name: ${result.threadName}`)
    console.log(bot)
    const thread = await bot.createForumTopic(context.chatId, result.threadName)
    // console.log(thread)
    // console.log("Thread created with ID:", thread.message_thread_id);
    // result.onThreadCreated(thread.message_thread_id);
}

export default handleTelegramResult;