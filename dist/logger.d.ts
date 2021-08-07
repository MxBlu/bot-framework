/// <reference types="node" />
import EventEmitter from "events";
import { LogLevel } from "./constants/log_levels.js";
export declare class Logger {
    name: string;
    loggerVerbosity: LogLevel;
    constructor(name: string);
    log(message: string, severity: LogLevel): void;
    error(message: string): void;
    warn(message: string): void;
    info(message: string): void;
    debug(message: string): void;
    trace(message: string): void;
}
export declare const NewLogEmitter: EventEmitter;
