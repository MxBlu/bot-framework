import { TRIGGER_RESOLUTION } from "./constants";
import { Logger } from "./logger";
export class TimerTask {
}
export class HighResolutionTimer {
    constructor() {
        this.timerTask = async () => {
            const now = Date.now();
            this.logger.trace(`Running timer task, interval: ${this.lastRun == null ? 'never' : now - this.lastRun}`);
            this.lastRun = now;
            // Iterate over all the tasks
            // Trigger what's ready, and figure out how long to sleep for
            let lowestDelta = null;
            for (const task of this.timerTasks.values()) {
                const delta = task.targetTime.getTime() - now;
                // If it's time to trigger the task, run it and remove it from the tasks
                if (delta < TRIGGER_RESOLUTION) {
                    this.timerTasks.delete(task.id);
                    task.triggerFunction(task);
                    continue;
                }
                // Update the lowest delta if we have a new low
                if (lowestDelta == null || delta < lowestDelta) {
                    lowestDelta = delta;
                }
            }
            // Run the task again, if there's anything to run
            if (lowestDelta != null) {
                this.handle = setTimeout(this.timerTask, lowestDelta / 2);
            }
            else {
                // If nothing to run, mark timer as inactive
                this.handle = null;
            }
        };
        this.timerTasks = new Map();
        this.handle = null;
        this.logger = new Logger("HighResolutionTimer");
    }
    getTimers() {
        return this.timerTasks;
    }
    hasTimer(id) {
        return this.timerTasks.has(id);
    }
    addTimer(task) {
        // Ensure a task with the same ID doesn't exist
        if (this.timerTasks.has(task.id)) {
            throw new Error("Timer with given ID already exists");
        }
        this.timerTasks.set(task.id, task);
        // Stop existing timerTask handle if exists
        if (this.handle != null) {
            clearTimeout(this.handle);
        }
        // Run the timerTask to ensure we don't sleep over this taskq
        this.timerTask();
    }
    removeTimer(id) {
        this.timerTasks.delete(id);
    }
}
//# sourceMappingURL=timer.js.map