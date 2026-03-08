
import UpdateController from "../controllers/update.controller.js";
import bot from "../lib/bot.js";
import { useAuth } from "../middleware/index.js";

bot.onText(/\/update/, useAuth(UpdateController.updateAllTrackings));