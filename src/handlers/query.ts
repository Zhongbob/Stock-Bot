import bot from "../lib/bot.js";
import QueryController from "../controllers/query.controller.js";
import checkAuth from "../middleware/auth.middleware.js";
import { useAuth } from "../middleware/index.js";

bot.onText(/\/search/, useAuth(QueryController.search));
