import { Logger } from "./logger";
export declare class TimerTask {
    id: string;
    targetTime: Date;
    triggerFunction: (task: TimerTask) => Promise<void>;
}
export declare class HighResolutionTimer {
    timerTasks: Map<string, TimerTask>;
    handle: NodeJS.Timeout;
    lastRun: number;
    logger: Logger;
    constructor();
    getTimers(): Map<string, TimerTask>;
    hasTimer(id: string): boolean;
    addTimer(task: TimerTask): void;
    removeTimer(id: string): void;
    private timerTask;
}
