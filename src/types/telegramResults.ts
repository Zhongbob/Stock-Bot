interface DefaultResult {
    type: string;
    action: "edit" | "reply" | "send" | "misc"
    data?: any;
    shouldStop?: boolean; //If true, the handler should stop processing additional results
    text?: (markdown?: boolean) => string;
    threadId?: number;
}

interface SendTextResult extends DefaultResult {
    type: "text";
    action: "send";
    text: (markdown?: boolean) => string;
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
}

type TelegramResult = SendTextResult | CreateThreadResult | StopResult | ImageResult;
export type { SendTextResult, CreateThreadResult, DefaultResult, StopResult, ImageResult, TelegramResult };