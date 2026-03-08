import prisma from "../lib/prisma.js";
import type { ChatInfo } from "../types/telegramTypes.js";
import BaseRepository from "./base.repository.js";

class TrackRepository extends BaseRepository {
    async create(chatId: number, symbol: string, threadId: number) {
        return await this.tx.trackedStock.upsert({
            where: {
                telegramGroupId_threadId_symbol: {
                    telegramGroupId: chatId,
                    threadId: threadId,
                    symbol
                }
            },
            create: {
                telegramGroupId: chatId,
                symbol,
                threadId: threadId // Placeholder, will be updated when thread is created
            },
            update: {
            }
        });
    }
    async findBySymbol(chatId: number, symbol: string) {
        return await this.tx.trackedStock.findMany({
            where: {
                telegramGroupId: chatId,
                symbol
            }
        });
    }
    async delete(chatId: number, symbolOrThreadId: {symbol: string}|{threadId: number}) {
        if ("threadId" in symbolOrThreadId) {
            return await this.tx.trackedStock.deleteMany({
                where: {
                    telegramGroupId: chatId,
                    threadId: symbolOrThreadId.threadId
                }            
            });
        }
        return await this.tx.trackedStock.deleteMany({
            where: {
                telegramGroupId: chatId,
                symbol: symbolOrThreadId.symbol
            }
        });
    }
    async updateThreadId(chatId: number, symbol: string, oldThreadId: number, threadId: number) {
        return await this.tx.trackedStock.update({
            where: {
                telegramGroupId_threadId_symbol: {
                    telegramGroupId: chatId,
                    symbol: symbol,
                    threadId: oldThreadId
                }
            },
            data: {
                threadId
            }
        });
    }
    async updateTrackingId(type: "detail"|"chart", symbol: string, chatInfo: ChatInfo, trackingId: number) {
        const { chatId, threadId } = chatInfo;
        if (type != "detail" && type !== "chart") {
            throw new Error("Invalid type");
        }
        const fieldToUpdate = type === "detail" ? "detailMessageId" : "chartMessageId";
        return await this.tx.trackedStock.update({
            where: {
                telegramGroupId_threadId_symbol: {
                    telegramGroupId: chatId,
                    symbol: symbol,
                    threadId: threadId ?? -1
                }
            },
            data: {
                [fieldToUpdate]: trackingId
            }
        });
    }
    async findAll(telegramGroupId?: number) {
        return await this.tx.trackedStock.findMany({
            ...(
                telegramGroupId && {
                    where: {
                        telegramGroupId
                    }
                }
            )
        });
    }
}
const trackRepository = new TrackRepository(prisma);

export default TrackRepository;
export {trackRepository}