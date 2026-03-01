import bot from "../lib/bot.js";
import ConfigController from "../controllers/config.controller.js";
import defaultMiddleware, { useAuth } from "../middleware/index.js";

bot.onText(/\/start/, defaultMiddleware(ConfigController.start));
bot.onText(/\/track/, useAuth(ConfigController.track));