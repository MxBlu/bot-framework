var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TRIGGER_RESOLUTION } from "./constants/constants.js";
import { Logger } from "./logger.js";
export class TimerTask {
}
export class HighResolutionTimer {
    constructor() {
        this.timerTask = () => __awaiter(this, void 0, void 0, function* () {
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
        });
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