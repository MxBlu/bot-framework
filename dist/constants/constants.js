import * as dotenv from 'dotenv';
dotenv.config();
import { LogLevel } from "./log_levels.js";
/** Default logging level */
export const DEFAULT_LOG_LEVEL = LogLevel[process.env.LOG_LEVEL] || LogLevel.INFO;
/** Padding length with name */
export const LOGGER_NAME_PAD_LENGTH = 20;
/** Default time for a modal to stay active */
export const DEFAULT_MODAL_DURATION = 120000; // 2 minutes
/** Min time delta to trigger a timer event */
export const TRIGGER_RESOLUTION = 500; // 500ms
/** Whether Cluster support is enabled or not */
export const CLUSTER_ENABLED = envFlagOrDefault('CLUSTER_ENABLED', false);
/** Time before trying to reconnect to Zookeeper */
export const CLUSTER_RECONNECT_TIMEOUT = 15000;
/** Env flag to determine whether to register commands or not  */
export const DISCORD_REGISTER_COMMANDS = envFlagOrDefault('DISCORD_REGISTER_COMMANDS', true);
/** Env flag to determine whether to register slash commands as global commands or as guild commands */
export const DISCORD_REGISTER_COMMANDS_AS_GLOBAL = envFlagOrDefault('DISCORD_REGISTER_COMMANDS_AS_GLOBAL', false);
/** Env flag to determine whether to send error logs to the specified error channel */
export const DISCORD_ERROR_LOGGING_ENABLED = envFlagOrDefault('DISCORD_ERROR_LOGGING_ENABLED', true);
/** Env flag to determine whether to send all logs to the specified error channel */
export const DISCORD_GENERAL_LOGGING_ENABLED = envFlagOrDefault('DISCORD_GENERAL_LOGGING_ENABLED', false);
/** Channel to post error logs to */
export const DISCORD_ERROR_CHANNEL = process.env.DISCORD_ERROR_CHANNEL;
/** Time to wait before resetting "error" status on Discord logging */
export const DISCORD_LOG_ERROR_STATUS_RESET = 60000; // 10 minutes
/**
 * Get a boolean environment variable or return the default value
 * @param variableName Environment variable name
 * @param defaultValue Default boolean value
 * @returns Boolean environment variable or default value
 */
export function envFlagOrDefault(variableName, defaultValue) {
    if (process.env[variableName] != null) {
        return process.env[variableName] === 'true';
    }
    else {
        return defaultValue;
    }
}
//# sourceMappingURL=constants.js.map