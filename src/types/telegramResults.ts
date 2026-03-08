import type { Message } from "node-telegram-bot-api";

interface DefaultResult {
    type: string;
    action: "edit" | "reply" | "send" | "misc"
    data?: any;
    shouldStop?: boolean; //If true, the handler should stop processing additional results
    text?: (markdown?: boolean) => string;
    threadId?: number;
    chatId?: bigint;
}

interface SendTextResult extends DefaultResult {
    type: "text";
    action: "send";
    text: (markdown?: boolean) => string;
    onMessageSent?: (message: Message) => void | Promise<void>; // Optional callback to receive the sent message ID
    data?: any;
}

interface CreateThreadResult extends DefaultResult {
    type: "createThread";
    action: "misc";
    threadName: string;
    onThreadCreated: (threadId: number) => void;
    onThreadExists: (threadId: number) => void;
}

interface StopResult extends DefaultResult {
    type: "stop";
    action: "misc";
    reason: string;
}
interface ImageResult extends DefaultResult {
    type: "image";
    action: "send";
    image: Buffer;
    caption?: string;
    onMessageSent?: (message: Message) => void | Promise<void>; // Optional callback to receive the sent message ID
}

type TelegramSendResult = SendTextResult | ImageResult;
type TelegramEditResult = WithEditAction<SendTextResult> | WithEditAction<ImageResult>;
type TelegramMiscResult = CreateThreadResult | StopResult;
type TelegramResult = TelegramSendResult | TelegramEditResult | TelegramMiscResult;
type WithRequiredChatId<T extends DefaultResult> = Omit<T, "chatId"> & {
    chatId: bigint;
};
type WithEditAction<T extends DefaultResult> = Omit<WithRequiredChatId<T>, "action"> & {
    action: "edit";
    messageId: number;
};

export type {
    SendTextResult,
    CreateThreadResult,
    DefaultResult,
    StopResult,
    ImageResult,
    TelegramResult,
    WithRequiredChatId,
    TelegramSendResult,
    TelegramEditResult,
    TelegramMiscResult,
    WithEditAction
};