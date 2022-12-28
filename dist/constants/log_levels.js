/**
 * Log levels for use with {@link Logger}
 */
export var LogLevel;
(function (LogLevel) {
    /** If set on a logger, ignore all log messages */
    LogLevel[LogLevel["IGNORE"] = -1] = "IGNORE";
    /** Error messages */
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    /** Warning messages */
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    /** Informational messages */
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    /** Debugging messages */
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
    /** Verbose debugging messages */
    LogLevel[LogLevel["TRACE"] = 4] = "TRACE";
})(LogLevel || (LogLevel = {}));
//# sourceMappingURL=log_levels.js.map