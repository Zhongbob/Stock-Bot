import UpdateService from "../services/update.service.js";
import type { ControllerActionMap } from "../types/defaultController.js";
import handleTelegramResult from "../utils/handleTelegramResult.js";

const UpdateController: ControllerActionMap = {
    updateAllTrackings: async function () {
        const telegramGroupId = this.msg.chat.id;
        const responses = await UpdateService.updateAllTrackings(telegramGroupId);
        for (const responseGroup of responses) {
            await handleTelegramResult(responseGroup, {});
        }
    }
}



export default UpdateController;