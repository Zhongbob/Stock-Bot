import bot from "../lib/bot.js";
import type { CreateThreadResult, TelegramMiscResult } from "../types/telegramResults.js";

async function handleTelegramMiscResult(result: TelegramMiscResult, context: any) {
    switch (result.type) {
        case "createThread":
            await handleCreateThreadResult(result, context);
            break;
        default:
            console.warn("Unknown misc result type:", result.type);
    }
}
async function handleCreateThreadResult(result: CreateThreadResult, context: any) {
    
    const thread = await bot.createForumTopic(context.chatId, result.threadName)
    // console.log("Thread created with ID:", thread.message_thread_id);
    result.onThreadCreated(thread.message_thread_id);
    context.msg.message_thread_id = thread.message_thread_id; // Update context with new thread ID
}

export default handleTelegramMiscResult;