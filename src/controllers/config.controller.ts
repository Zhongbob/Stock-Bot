import TrackService from "../services/track.service.js";
import handleTelegramResult from "../utils/handleTelegramResult.js";

const ConfigController = {  
    start: async () => {
        console.log("ConfigController started");
    },
    track: async function() {
        const result = await TrackService.trackStock(this.rawArgs, this.chatId)
        handleTelegramResult(result, this)
    }
}

export default ConfigController;