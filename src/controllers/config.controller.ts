import type { DefaultParsedContext } from "../middleware/defaultParser.middleware.js";
import ConfigService from "../services/config.service.js";
import SearchService from "../services/search.service.js";
import TrackService from "../services/track.service.js";
import type { ControllerActionMap } from "../types/defaultController.js";
import handleTelegramResult from "../utils/handleTelegramResult.js";

const ConfigController: ControllerActionMap = {  
    start: async function() {
        const chat = this.msg.chat
        const result = await ConfigService.startGroup(chat.id, chat.title??`Chat ${chat.id}`)
        await handleTelegramResult(result, this)
    },
    track: async function() {
        console.log(this)
        const symbol = this.args._.join(" ")
        let result 
        if (this.args["link"]) {
            result = await TrackService.trackStock(symbol, this.chatId, this.msg.message_thread_id)
        }
        else {
            result = await TrackService.trackStock(symbol, this.chatId)
        }
        await handleTelegramResult(result, this)
    }
}

export default ConfigController;