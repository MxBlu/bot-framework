import { CommandInteraction, Guild, GuildChannel, GuildMember, MessageComponentInteraction, Role, TextBasedChannel, ThreadChannel, User } from "discord.js";
import { LogLevel } from "./constants/log_levels.js";
import { Logger } from "./logger.js";
/**
 * Split up a string into ideally endline terminated strings at most length DISCORD_MAX_LEN
 * @param str String to split
 * @returns List of strings at most DISCORD_MAX_LENGTH long
 */
export declare const chunkString: (str: string) => string[];
/**
 * Send reply to a user command, logging if appropriate
 * @param interaction {@link CommandInteraction} to reply to
 * @param msg Reply message
 * @param logger Command handler {@link Logger}
 * @param level {@link LogLevel} for the reply
 */
export declare const sendCmdReply: (interaction: CommandInteraction | MessageComponentInteraction, msg: string, logger: Logger, level: LogLevel) => Promise<void>;
/**
 * Send reply to a user command which may potentially be large
 * @param interaction {@link CommandInteraction} to reply to
 * @param msg Reply message
 */
export declare const sendChunkedReply: (interaction: CommandInteraction | MessageComponentInteraction, msg: string) => Promise<void>;
/**
 * Send message to a given channel, chunking if necessary
 * @param targetChannel Channel to send message in
 * @param msg Message to send
 */
export declare const sendMessage: (targetChannel: TextBasedChannel, msg: string) => void;
/**
 * Compare 2 strings ignoring case
 *
 * Will compare null strings to each other as well
 * @param str1 First string
 * @param str2 Second string
 * @returns Equivalence of the two strings
 */
export declare const stringEquivalence: (str1: string, str2: string) => boolean;
/**
 * Search for str2 in str1 ignoring case
 *
 * If either string is null, will return whether both strings are null
 * @param str String to search
 * @param searchString String to search for within `str`
 * @returns
 */
export declare const stringSearch: (str: string, searchString: string) => boolean;
/**
 * Test if a given user is an admin in a given guild
 * @param guild Discord.js Guild
 * @param user Discord.js User
 * @returns Given user is an admin in a given guild
 */
export declare const isAdmin: (guild: Guild, user: User) => Promise<boolean>;
/**
 * Given a mention or name, provide a {@link GuildMember} if any matching exist
 * @param userString Part of a username or nickname, or a complete user mention
 * @param guild Discord.js Guild
 * @returns A {@link GuildMember} if one existing matching query, otherwise null
 */
export declare const findGuildMember: (userString: string, guild: Guild) => Promise<GuildMember | null>;
/**
 * Given a mention or name, provide a {@link GuildChannel} or {@link ThreadChannel} if any matching exist
 * @param channelString Part of a channel/thread name, or a complete channel/thread mention
 * @param guild Discord.js Guild
 * @returns A {@link GuildChannel} or {@link ThreadChannel}  if one existing matching query, otherwise null
 */
export declare const findGuildChannel: (channelString: string, guild: Guild) => Promise<ThreadChannel | GuildChannel | null>;
/**
 * Given a mention or name, provide a {@link Role} if any matching exist
 * @param channelString Part of a role name, or a complete role mention
 * @param guild Discord.js Guild
 * @returns A {@link Role} if one existing matching query, otherwise null
 */
export declare const findGuildRole: (roleString: string, guild: Guild) => Promise<Role>;
