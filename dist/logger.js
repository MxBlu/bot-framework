import * as dotenv from 'dotenv';
dotenv.config();
import EventEmitter from "events";
import { DEFAULT_LOG_LEVEL } from "./constants/constants.js";
import { LogLevel } from "./constants/log_levels.js";
// Get a date-time string of the current date-time
function getDateTimeString() {
    var now = new Date();
    var yr = now.getFullYear();
    var mth = now.getMonth().toString().padStart(2, '0');
    var day = now.getDate().toString().padStart(2, '0');
    var hrs = now.getHours().toString().padStart(2, '0');
    var min = now.getMinutes().toString().padStart(2, '0');
    var sec = now.getSeconds().toString().padStart(2, '0');
    return yr + "-" + mth + "-" + day + " " + hrs + ":" + min + ":" + sec;
}
/*
  Simple logging assistant
  Mostly for the job of appending timestamps
  Also logs errors to Discord if available
*/
var Logger = /** @class */ (function () {
    function Logger(name) {
        this.name = name;
        this.loggerVerbosity = Number(process.env[name + ".LOG_LEVEL"]) || DEFAULT_LOG_LEVEL;
    }
    // Log to console, and publish to NewLog emitter
    Logger.prototype.log = function (message, severity) {
        // Only log events above our specified verbosity
        if (this.loggerVerbosity >= severity) {
            var severityStr = LogLevel[severity];
            // Aiming for `${datetime} ${severity /pad(5)} --- ${name}: ${message}`
            var logStr = getDateTimeString() + " " + severityStr.padEnd(5) + " --- " + this.name + ": " + message;
            // Log ERROR to stderr, rest to stdout
            if (severity == LogLevel.ERROR) {
                console.error(logStr);
            }
            else {
                console.log(logStr);
            }
            // Publish event to emitter
            NewLogEmitter.emit(severityStr, logStr);
        }
    };
    // Log event as ERROR
    Logger.prototype.error = function (message) {
        this.log(message, LogLevel.ERROR);
    };
    // Log event as WARN
    Logger.prototype.warn = function (message) {
        this.log(message, LogLevel.WARN);
    };
    // Log event as INFO
    Logger.prototype.info = function (message) {
        this.log(message, LogLevel.INFO);
    };
    // Log event as DEBUG
    Logger.prototype.debug = function (message) {
        this.log(message, LogLevel.DEBUG);
    };
    // Log event as TRACE
    Logger.prototype.trace = function (message) {
        this.log(message, LogLevel.TRACE);
    };
    return Logger;
}());
export { Logger };
// Message topic for logging events
// Events emitted are the different levels of severity
export var NewLogEmitter = new EventEmitter();
//# sourceMappingURL=logger.js.map