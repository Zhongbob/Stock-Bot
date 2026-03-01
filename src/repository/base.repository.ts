import type { Prisma } from "@prisma/client";

class BaseRepository {
    constructor(protected tx: Prisma.TransactionClient) {}
}

export default BaseRepository;