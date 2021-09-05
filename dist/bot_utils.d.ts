import { CommandInteraction, Guild, GuildChannel, GuildMember, Message, Role, TextBasedChannels, ThreadChannel } from "discord.js";
import { LogLevel } from "./constants/log_levels.js";
import { Logger } from "./logger.js";
export declare const chunkString: (str: string) => string[];
export declare const sendCmdReply: (interaction: CommandInteraction, msg: string, logger: Logger, level: LogLevel) => Promise<void>;
export declare const sendMessage: (targetChannel: TextBasedChannels, msg: string) => void;
export declare const stringEquivalence: (str1: string, str2: string) => boolean;
export declare const stringSearch: (str1: string, str2: string) => boolean;
export declare const isAdmin: (message: Message) => Promise<boolean>;
export declare const findGuildMember: (userString: string, guild: Guild) => Promise<GuildMember>;
export declare const findGuildChannel: (channelString: string, guild: Guild) => Promise<ThreadChannel | GuildChannel>;
export declare const findGuildRole: (roleString: string, guild: Guild) => Promise<Role>;
