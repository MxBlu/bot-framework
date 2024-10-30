import EventEmitter from "events";
import { LogLevel } from "./constants/log_levels.js";
/**
 * Simple logging helper
 *
 * Logger verbosity is acquired from the environment in the format of `${loggerName}.LOG_LEVEL`
 * where the value is a {@link LogLevel} value
 *
 * If not verbosity is set in the environment, it defaults to {@link DEFAULT_LOG_LEVEL}
 */
export declare class Logger {
    /** Name to append on to logs */
    name: string;
    /** Min verbosity for a log message to be processed */
    loggerVerbosity: LogLevel;
    /**
     * Construct a new Logger
     * @param name Logger name
     */
    constructor(name: string);
    /**
     * Log to console, and publish to NewLog emitter
     * @param message Log message
     * @param severity Serverity of log message
     */
    log(message: string, severity: LogLevel): void;
    /**
     * Log a message with severity {@link LogLevel.ERROR}
     * @param message Log message
     */
    error(message: string): void;
    /**
     * Log a message with severity {@link LogLevel.ERROR}
     * @param message Log message
     */
    warn(message: string): void;
    /**
     * Log a message with severity {@link LogLevel.WARN}
     * @param message Log message
     */
    info(message: string): void;
    /**
     * Log a message with severity {@link LogLevel.DEBUG}
     * @param message Log message
     */
    debug(message: string): void;
    /**
     * Log a message with severity {@link LogLevel.TRACE}
     * @param message Log message
     */
    trace(message: string): void;
    /**
     * Register this {@link Logger} as the global uncaught exception logger
     */
    registerAsGlobal(): void;
}
/**
 * Message topic for logging events
 *
 * Events emitted are the different levels of severity
 */
export declare const NewLogEmitter: EventEmitter;
