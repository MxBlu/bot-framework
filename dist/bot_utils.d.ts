import { DMChannel, Message, NewsChannel, TextChannel } from "discord.js";
import { LogLevel } from "./constants/log_levels.js";
import { Logger } from "./logger.js";
export declare const chunkString: (str: string) => string[];
export declare const sendCmdMessage: (message: Message, msg: string, logger: Logger, level: LogLevel) => void;
export declare const sendMessage: (targetChannel: TextChannel | DMChannel | NewsChannel, msg: string) => void;
export declare const stringEquivalence: (str1: string, str2: string) => boolean;
export declare const stringSearch: (str1: string, str2: string) => boolean;
export declare const isAdmin: (message: Message) => Promise<boolean>;