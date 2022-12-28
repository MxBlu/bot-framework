/** Default logging level */
export declare const DEFAULT_LOG_LEVEL: any;
/** Padding length with name */
export declare const LOGGER_NAME_PAD_LENGTH = 20;
/** Default time for a modal to stay active */
export declare const DEFAULT_MODAL_DURATION = 120000;
/** Min time delta to trigger a timer event */
export declare const TRIGGER_RESOLUTION = 500;
/** Env flag to determine whether to register commands or not  */
export declare const DISCORD_REGISTER_COMMANDS: boolean;
/** Env flag to determine whether to register slash commands as global commands or as guild commands */
export declare const DISCORD_REGISTER_COMMANDS_AS_GLOBAL: boolean;
/** Env flag to determine whether to send error logs to the specified error channel */
export declare const DISCORD_ERROR_LOGGING_ENABLED: boolean;
/** Env flag to determine whether to send all logs to the specified error channel */
export declare const DISCORD_GENERAL_LOGGING_ENABLED: boolean;
/** Channel to post error logs to */
export declare const DISCORD_ERROR_CHANNEL: string;
/** Time to wait before resetting "error" status on Discord logging */
export declare const DISCORD_LOG_ERROR_STATUS_RESET = 60000;
/**
 * Get a boolean environment variable or return the default value
 * @param variableName Environment variable name
 * @param defaultValue Default boolean value
 * @returns Boolean environment variable or default value
 */
export declare function envFlagOrDefault(variableName: string, defaultValue: boolean): boolean;
