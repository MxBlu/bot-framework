import * as dotenv from 'dotenv';
dotenv.config();
import EventEmitter from "events";
import { DEFAULT_LOG_LEVEL, LOGGER_NAME_PAD_LENGTH } from "./constants";
import { LogLevel } from "./constants/log_levels";
// Get a date-time string of the current date-time
/**
 * Generate a date-time string of the current date-time
 * @returns Date-time string
 */
function getDateTimeString() {
    const now = new Date();
    const yr = now.getFullYear();
    // getMonth() is index-0, so gotta add 1...
    const mth = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hrs = now.getHours().toString().padStart(2, '0');
    const min = now.getMinutes().toString().padStart(2, '0');
    const sec = now.getSeconds().toString().padStart(2, '0');
    return `${yr}-${mth}-${day} ${hrs}:${min}:${sec}`;
}
// Collapse down longer strings by trimming namespace substrings
/**
 * Collapse a logger name down to by collapsing all but the most qualified name to a single character
 * @param name Logger name
 * @returns Collapsed logger name
 */
function collapseNamespaces(name) {
    const namespaces = name.split('.');
    const mostQualifiedName = namespaces.pop();
    return namespaces.map(n => n.substr(0, 1)).concat(mostQualifiedName).join('.');
}
/**
 * Simple logging helper
 *
 * Logger verbosity is acquired from the environment in the format of `${loggerName}.LOG_LEVEL`
 * where the value is a {@link LogLevel} value
 *
 * If not verbosity is set in the environment, it defaults to {@link DEFAULT_LOG_LEVEL}
 */
export class Logger {
    /**
     * Construct a new Logger
     * @param name Logger name
     */
    constructor(name) {
        this.name = name;
        this.loggerVerbosity = LogLevel[process.env[`${name}.LOG_LEVEL`]] || DEFAULT_LOG_LEVEL;
    }
    /**
     * Log to console, and publish to NewLog emitter
     * @param message Log message
     * @param severity Serverity of log message
     */
    log(message, severity) {
        // Only log events above our specified verbosity
        if (this.loggerVerbosity >= severity) {
            const severityStr = LogLevel[severity];
            const nameStr = collapseNamespaces(this.name);
            // Aiming for `${datetime} ${severity /pad(5)} --- ${name}: ${message}`
            const logStr = `${getDateTimeString()} ${severityStr.padEnd(5)} --- ${nameStr.padEnd(LOGGER_NAME_PAD_LENGTH)}: ${message}`;
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
    }
    /**
     * Log a message with severity {@link LogLevel.ERROR}
     * @param message Log message
     */
    error(message) {
        this.log(message, LogLevel.ERROR);
    }
    /**
     * Log a message with severity {@link LogLevel.ERROR}
     * @param message Log message
     */
    warn(message) {
        this.log(message, LogLevel.WARN);
    }
    /**
     * Log a message with severity {@link LogLevel.WARN}
     * @param message Log message
     */
    info(message) {
        this.log(message, LogLevel.INFO);
    }
    /**
     * Log a message with severity {@link LogLevel.DEBUG}
     * @param message Log message
     */
    debug(message) {
        this.log(message, LogLevel.DEBUG);
    }
    /**
     * Log a message with severity {@link LogLevel.TRACE}
     * @param message Log message
     */
    trace(message) {
        this.log(message, LogLevel.TRACE);
    }
    /**
     * Register this {@link Logger} as the global uncaught exception logger
     */
    registerAsGlobal() {
        process
            .on('unhandledRejection', (reason) => {
            if (reason instanceof Error) {
                this.error(`Uncaught promise rejection: ${reason}\n` +
                    `${reason.stack}`);
            }
            else {
                this.error(`Uncaught promise rejection: ${reason}`);
            }
        });
        process.on('uncaughtException', err => {
            this.error(`Uncaught exception, exiting: ${err}\n` +
                `${err.stack}`);
            process.exit(1);
        });
    }
}
/**
 * Message topic for logging events
 *
 * Events emitted are the different levels of severity
 */
export const NewLogEmitter = new EventEmitter();
//# sourceMappingURL=logger.js.map