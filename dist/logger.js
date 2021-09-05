import * as dotenv from 'dotenv';
dotenv.config();
import EventEmitter from "events";
import { DEFAULT_LOG_LEVEL, LOGGER_NAME_PAD_LENGTH } from "./constants/constants.js";
import { LogLevel } from "./constants/log_levels.js";
// Get a date-time string of the current date-time
function getDateTimeString() {
    const now = new Date();
    const yr = now.getFullYear();
    const mth = now.getMonth().toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hrs = now.getHours().toString().padStart(2, '0');
    const min = now.getMinutes().toString().padStart(2, '0');
    const sec = now.getSeconds().toString().padStart(2, '0');
    return `${yr}-${mth}-${day} ${hrs}:${min}:${sec}`;
}
// Collapse down longer strings by trimming namespace substrings
function collapseNamespaces(name) {
    const namespaces = name.split('.');
    const mostQualifiedName = namespaces.pop();
    return namespaces.map(n => n.substr(0, 1)).concat(mostQualifiedName).join('.');
}
/*
  Simple logging assistant
  Mostly for the job of appending timestamps
  Also logs errors to Discord if available
*/
export class Logger {
    constructor(name) {
        this.name = name;
        this.loggerVerbosity = LogLevel[process.env[`${name}.LOG_LEVEL`]] || DEFAULT_LOG_LEVEL;
    }
    // Log to console, and publish to NewLog emitter
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
    // Log event as ERROR
    error(message) {
        this.log(message, LogLevel.ERROR);
    }
    // Log event as WARN
    warn(message) {
        this.log(message, LogLevel.WARN);
    }
    // Log event as INFO
    info(message) {
        this.log(message, LogLevel.INFO);
    }
    // Log event as DEBUG
    debug(message) {
        this.log(message, LogLevel.DEBUG);
    }
    // Log event as TRACE
    trace(message) {
        this.log(message, LogLevel.TRACE);
    }
    // Set this logger to handle all fall-through logging events from Node.JS
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
// Message topic for logging events
// Events emitted are the different levels of severity
export const NewLogEmitter = new EventEmitter();
//# sourceMappingURL=logger.js.map