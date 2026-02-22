import bot from "../lib/bot.js";
import SearchService from "../services/search.service.js";
import handleTelegramResult from "../utils/handleTelegramResult.js";

const QueryController = {  
    summary: function() {
        console.log(this)
    },
    search: async function(){
        const result = await SearchService.searchByKeyword(this.rawArgs)
        handleTelegramResult(result, this)
    }
}

export default QueryController;