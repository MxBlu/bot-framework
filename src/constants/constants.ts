import * as dotenv from 'dotenv';
dotenv.config();

import { LogLevel } from "./log_levels.js";

// Default logging level
export const DEFAULT_LOG_LEVEL = LogLevel[process.env.LOG_LEVEL] || LogLevel.INFO;

// Default time for a modal to stay active
export const DEFAULT_MODAL_DURATION = 120000; // 2 minutes

// Min time delta to trigger a timer event
export const TRIGGER_RESOLUTION = 500; // 500ms

// Channel to post error logs to
export const DISCORD_ERROR_CHANNEL = process.env.DISCORD_ERROR_CHANNEL;

// Time to wait before resetting "error" status on Discord logging
export const DISCORD_LOG_ERROR_STATUS_RESET = 60000; // 10 minutes