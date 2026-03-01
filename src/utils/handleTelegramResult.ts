import { StopProcessingError } from "../errors/telegramErrors.js";
import bot from "../lib/bot.js";
import type { CreateThreadResult, ImageResult, SendTextResult, TelegramResult } from "../types/telegramResults.js"
import telegramifyMarkdown from "telegramify-markdown";

async function handleTelegramResult(result: TelegramResult|TelegramResult[], context: any) {
    if (Array.isArray(result)) {
        for (const r of result) {
            await handleTelegramResult(r, context);
        }
        return;
    }
    switch (result.type) {
        case "text":
            break
        case "createThread":
            await handleCreateThreadResult(result, context);
            break;
        case "image":
            await handleSendPhotoResult(result, context);
            break;
        case "stop":
            console.log("Processing stopped. Reason:", result.reason || "No reason provided");
            throw new StopProcessingError(result.reason || "Processing stopped by result instruction.");
        default:
            console.warn("Unknown result type:", result.type);
    }
    if (result.text) {
        await handleSendTextResult(result as SendTextResult, context);
    }
    if (result.shouldStop) {
        console.log("Result indicates to stop further processing.");
        throw new StopProcessingError("Processing stopped by result instruction.");
    }
}

async function handleSendPhotoResult(result: ImageResult, context: any) {
    const threadId = result.threadId || context.msg.message_thread_id
    await bot.sendPhoto(context.chatId, result.image, { caption: result.caption, message_thread_id: threadId });
}
async function handleSendTextResult(result: SendTextResult, context: any) {
    const threadId = result.threadId || context.msg.message_thread_id
    const text = telegramifyMarkdown(result.text!(true), "escape"); // Assuming text function is always provided for SendTextResult
    await bot.sendMessage(context.chatId, text,
        { message_thread_id: threadId, parse_mode: "MarkdownV2" }
    );
}

async function handleCreateThreadResult(result: CreateThreadResult, context: any) {
    console.log(`Creating thread with name: ${result.threadName}`)
    console.log(bot)
    const thread = await bot.createForumTopic(context.chatId, result.threadName)
    console.log(thread)
    // console.log("Thread created with ID:", thread.message_thread_id);
    result.onThreadCreated(thread.message_thread_id);
    context.msg.message_thread_id = thread.message_thread_id; // Update context with new thread ID
}

export default handleTelegramResult;