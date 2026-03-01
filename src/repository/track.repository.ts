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
        return await this.tx.trackedStock.delete({
            where: {
                telegramGroupId_symbol: {
                    telegramGroupId: chatId,
                    symbol: symbolOrThreadId.symbol
                }
            }
        });
    }
    async updateThreadId(chatId: number, symbol: string, threadId: number) {
        return await this.tx.trackedStock.update({
            where: {
                telegramGroupId_symbol: {
                    telegramGroupId: chatId,
                    symbol
                }
            },
            data: {
                threadId
            }
        });
    }
}
export default TrackRepository;