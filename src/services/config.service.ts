import prisma from "../lib/prisma.js"
import type { SendTextResult } from "../types/telegramResults.js";

const ConfigService: {
    startGroup: (groupId: number, groupName: string) => Promise<SendTextResult>
} = {
    async startGroup(groupId: number, groupName: string) {
        try {
            await prisma.telegramGroup.upsert({
                where: { 
                    telegramGroupId: groupId
                },
                create: {
                    telegramGroupId: groupId,
                    title: groupName
                },
                update: {
                    title: groupName
                },
            })
            return {
                type: "text",
                text: () => `Group "${groupName}" has been registered successfully!`
            }
        } catch (error) {
            console.error("Error in startGroup:", error);
            return {
                type: "text",
                text: () => `Failed to register group "${groupName}". Please try again later.`
            }
        }
    }
}
export default ConfigService;