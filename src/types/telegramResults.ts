interface DefaultResult {
    type: string;
    data?: any;
    shouldStop?: boolean; //If true, the handler should stop processing additional results
    text?: (markdown?: boolean) => string;
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

type TelegramResult = SendTextResult | CreateThreadResult | StopResult;
export type { SendTextResult, CreateThreadResult, DefaultResult, StopResult, TelegramResult };