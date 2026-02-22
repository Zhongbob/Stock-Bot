import TgFancy from "tgfancy";
import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";

dotenv.config();

const token = process.env.BOT_TOKEN;
if (!token) {
    throw new Error("BOT_TOKEN is not defined in the environment variables.");
}

const bot = new TelegramBot(token, { polling: true});

export default bot;