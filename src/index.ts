import "./lib/bot.js";
import "./handlers/config.js";
import "./handlers/query.js";
import "./handlers/update.js";
import startUpdateTrackingsJob from "./jobs/updateTrackings.job.js";
startUpdateTrackingsJob();