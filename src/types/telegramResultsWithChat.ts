import type { DefaultResult } from "./telegramResults.js";

interface DefaultResultWithChat extends DefaultResult {
    chatId: bigint;
}

interface SendTextResult extends DefaultResult {
    type: "text";
    text: (markdown?: boolean) => string;
    data?: any;
}

interface CreateThreadResult extends DefaultResult {
    type: "createThread";
    threadName: string;
    onThreadCreated: (threadId: number) => void;
    onThreadExists: (threadId: number) => void;
}

interface StopResult extends DefaultResult {
    type: "stop";
    reason: string;
}
interface ImageResult extends DefaultResult {
    type: "image";
    image: Buffer;
    caption?: string;
}

type TelegramResult = SendTextResult | CreateThreadResult | StopResult | ImageResult;
export type { SendTextResult, CreateThreadResult, DefaultResult, StopResult, ImageResult, TelegramResult };