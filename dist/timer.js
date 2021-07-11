var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import { TRIGGER_RESOLUTION } from "./constants/constants.js";
import { Logger } from "./logger.js";
var TimerTask = /** @class */ (function () {
    function TimerTask() {
    }
    return TimerTask;
}());
export { TimerTask };
var HighResolutionTimer = /** @class */ (function () {
    function HighResolutionTimer() {
        var _this = this;
        this.timerTask = function () { return __awaiter(_this, void 0, void 0, function () {
            var now, lowestDelta, _a, _b, task, delta;
            var e_1, _c;
            return __generator(this, function (_d) {
                now = Date.now();
                this.logger.trace("Running timer task, interval: " + (this.lastRun == null ? 'never' : now - this.lastRun));
                this.lastRun = now;
                lowestDelta = null;
                try {
                    for (_a = __values(this.timerTasks.values()), _b = _a.next(); !_b.done; _b = _a.next()) {
                        task = _b.value;
                        delta = task.targetTime.getTime() - now;
                        // If it's time to trigger the task, run it and remove it from the tasks
                        if (delta < TRIGGER_RESOLUTION) {
                            this.timerTasks["delete"](task.id);
                            task.triggerFunction(task);
                            continue;
                        }
                        // Update the lowest delta if we have a new low
                        if (lowestDelta == null || delta < lowestDelta) {
                            lowestDelta = delta;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_c = _a["return"])) _c.call(_a);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                // Run the task again, if there's anything to run
                if (lowestDelta != null) {
                    this.handle = setTimeout(this.timerTask, lowestDelta / 2);
                }
                else {
                    // If nothing to run, mark timer as inactive
                    this.handle = null;
                }
                return [2 /*return*/];
            });
        }); };
        this.timerTasks = new Map();
        this.handle = null;
        this.logger = new Logger("HighResolutionTimer");
    }
    HighResolutionTimer.prototype.getTimers = function () {
        return this.timerTasks;
    };
    HighResolutionTimer.prototype.hasTimer = function (id) {
        return this.timerTasks.has(id);
    };
    HighResolutionTimer.prototype.addTimer = function (task) {
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
    };
    HighResolutionTimer.prototype.removeTimer = function (id) {
        this.timerTasks["delete"](id);
    };
    return HighResolutionTimer;
}());
export { HighResolutionTimer };
//# sourceMappingURL=timer.js.map