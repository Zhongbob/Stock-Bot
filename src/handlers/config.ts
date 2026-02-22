import bot from "../lib/bot.js";
import ConfigController from "../controllers/config.controller.js";
import { useAuth } from "../middleware/index.js";

bot.onText(/\/start/, ConfigController.start);
bot.onText(/\/track/, useAuth(ConfigController.track));