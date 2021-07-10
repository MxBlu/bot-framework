import EventEmitter from "events";
import { DEFAULT_LOG_LEVEL } from "./constants/constants.js";
import { LogLevel } from "./constants/log_levels.js";
// Get a time string of the current time
function getTimeString() {
    var now = new Date();
    var hrs = now.getHours().toString().padStart(2, '0');
    var min = now.getMinutes().toString().padStart(2, '0');
    var sec = now.getSeconds().toString().padStart(2, '0');
    return hrs + ":" + min + ":" + sec;
}
// Size to pad the name field in log lines
var namePaddingSize = 0;
/*
  Simple logging assistant
  Mostly for the job of appending timestamps
  Also logs errors to Discord if available
*/
var Logger = /** @class */ (function () {
    function Logger(name, loggerVerbosity) {
        if (loggerVerbosity === void 0) { loggerVerbosity = DEFAULT_LOG_LEVEL; }
        this.name = name;
        this.loggerVerbosity = loggerVerbosity;
        // If this name is largest so far, update global name padding size
        if (name.length > namePaddingSize) {
            namePaddingSize = name.length;
        }
    }
    // Log to console, and publish to NewLog emitter
    Logger.prototype.log = function (message, verbosity) {
        // Only log events above our specified verbosity
        if (this.loggerVerbosity >= verbosity) {
            var verbosityStr = LogLevel[verbosity];
            var logStr = getTimeString() + " " + ("[" + this.name + "]").padStart(namePaddingSize + 2) + " " + ("[" + verbosityStr + "]").padStart(7) + " " + message;
            // Log ERROR to stderr, rest to stdout
            if (verbosity == LogLevel.ERROR) {
                console.error(logStr);
            }
            else {
                console.log(logStr);
            }
            // Publish event to emitter
            NewLogEmitter.emit(verbosityStr, logStr);
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
export var NewLogEmitter = new EventEmitter();
//# sourceMappingURL=logger.js.map