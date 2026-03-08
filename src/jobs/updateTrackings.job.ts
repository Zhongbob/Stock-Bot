import UpdateService from "../services/update.service.js";
import handleTelegramResult from "../utils/handleTelegramResult.js";
let intervalId: NodeJS.Timeout | null = null;
function startUpdateTrackingsJob() {
    if (intervalId) {
        console.warn("Update trackings job is already running.");
        return;
    }
    async function runJob() {
        console.log("Running update trackings job...");
        const responses = await UpdateService.updateAllTrackings();
        for (const responseGroup of responses) {
            await handleTelegramResult(responseGroup, {});
        }
    }
    runJob()
    intervalId = setInterval(runJob, 60 * 5 * 1000); // Update every 5 minutes
}
function stopUpdateTrackingsJob() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log("Update trackings job stopped.");
    }
}
export default startUpdateTrackingsJob;
export {
    startUpdateTrackingsJob,
    stopUpdateTrackingsJob
}