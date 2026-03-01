import bot from "../lib/bot.js";
import SearchService from "../services/search.service.js";
import type { ControllerActionMap } from "../types/defaultController.js";
import handleTelegramResult from "../utils/handleTelegramResult.js";

const QueryController: ControllerActionMap = {  
    summary: function() {
        console.log(this)
    },
    search: async function(){
        const result = await SearchService.searchByKeyword(this.rawArgs)
        handleTelegramResult(result, this)
    }
}

export default QueryController;