import type { DefaultResult } from "./telegramResults.js";

interface DefaultEditResult extends DefaultResult {
    chatId: bigint;
    threadId: number;
    messageId: number;
}

interface TextEditResult extends DefaultEditResult {
    type: "text";
    text: (markdown?: boolean) => string;
    data?: any;
}

interface ImageEditResult extends DefaultEditResult {
    type: "image";
    image: Buffer;
    caption?: string;
}

type TelegramEditResult = TextEditResult | ImageEditResult;
export type { TextEditResult, ImageEditResult, DefaultEditResult, TelegramEditResult };