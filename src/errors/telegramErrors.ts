class TelegramError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "TelegramError";
    }
}
class StopProcessingError extends TelegramError {
    reason: string;
    constructor(reason: string) {
        super(reason);
        this.reason = reason;
        this.name = "StopProcessingError";
    }
}
export { StopProcessingError, TelegramError };