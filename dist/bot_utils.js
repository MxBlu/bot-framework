var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PermissionFlagsBits } from "discord.js";
/** Max length a string can be in a Discord message */
const DISCORD_MAX_LEN = 1900;
/**
 * Split up a string into ideally endline terminated strings at most length DISCORD_MAX_LEN
 * @param str String to split
 * @returns List of strings at most DISCORD_MAX_LENGTH long
 */
export const chunkString = function (str) {
    const chunks = [];
    let strBuffer = '';
    // Split by newline and concat strings until ideal length
    // Then add so chunks list
    str.split("\n").forEach(s => {
        // A single oversized string, chunk by length
        if (s.length > DISCORD_MAX_LEN) {
            // Flush buffer as a chunk if there's any
            if (strBuffer.length > 0) {
                chunks.push(strBuffer);
                strBuffer = '';
            }
            for (let i = 0; i < s.length; i += DISCORD_MAX_LEN) {
                chunks.push(s.substr(i, DISCORD_MAX_LEN));
            }
            // Adding the current string would cause it to go oversized
            // Add the current buffer as a chunk, then set the buffer 
            //   to the current str
        }
        else if (strBuffer.length + s.length + 1 > DISCORD_MAX_LEN) {
            chunks.push(strBuffer);
            strBuffer = s + "\n";
            // Otherwise, add the string the the buffer
        }
        else {
            strBuffer += s + "\n";
        }
    });
    // Flush the buffer again
    if (strBuffer.length > 0) {
        chunks.push(strBuffer);
        strBuffer = '';
    }
    return chunks;
};
/**
 * Send reply to a user command, logging if appropriate
 * @param interaction {@link CommandInteraction} to reply to
 * @param msg Reply message
 * @param logger Command handler {@link Logger}
 * @param level {@link LogLevel} for the reply
 */
export const sendCmdReply = function (interaction, msg, logger, level) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.log(`${interaction.user.username} - ${interaction.guild.name} - ${msg}`, level);
        return sendChunkedReply(interaction, msg);
    });
};
/**
 * Send reply to a user command which may potentially be large
 * @param interaction {@link CommandInteraction} to reply to
 * @param msg Reply message
 */
export const sendChunkedReply = function (interaction, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        // Split up message into max length chunks
        const msgChunks = chunkString(msg);
        // Send first message as a reply
        // If the interaction has been deferred, edit the reply instead of creating a new one
        if (interaction.deferred) {
            yield interaction.editReply({ content: msgChunks.shift() });
        }
        else {
            yield interaction.reply({ content: msgChunks.shift() });
        }
        // Send subsequent messages as follow-ups
        for (const chunk of msgChunks) {
            yield interaction.followUp({ content: chunk });
        }
    });
};
/**
 * Send message to a given channel, chunking if necessary
 * @param targetChannel Channel to send message in
 * @param msg Message to send
 */
export const sendMessage = function (targetChannel, msg) {
    const msgChunks = chunkString(msg);
    msgChunks.forEach((chunk) => targetChannel.send(chunk));
};
/**
 * Compare 2 strings ignoring case
 *
 * Will compare null strings to each other as well
 * @param str1 First string
 * @param str2 Second string
 * @returns Equivalence of the two strings
 */
export const stringEquivalence = function (str1, str2) {
    // If either string is null, return whether both strings are null
    if (str1 === null || str2 === null) {
        return str1 === str2;
    }
    // Compare the lower-case strings
    return str1.toLowerCase() === str2.toLowerCase();
};
/**
 * Search for str2 in str1 ignoring case
 *
 * If either string is null, will return whether both strings are null
 * @param str String to search
 * @param searchString String to search for within `str`
 * @returns
 */
export const stringSearch = function (str, searchString) {
    // If either string is null, return whether both strings are null
    if (str === null || searchString === null) {
        return str === searchString;
    }
    // Lower case both strings, and search whether `searchString` is within `str`
    return str.toLowerCase().includes(searchString.toLowerCase());
};
/**
 * Test if a given user is an admin in a given guild
 * @param guild Discord.js Guild
 * @param user Discord.js User
 * @returns Given user is an admin in a given guild
 */
export const isAdmin = function (guild, user) {
    return __awaiter(this, void 0, void 0, function* () {
        // Fetch the GuildMember object for this user
        const member = yield guild.members.fetch(user.id);
        return isGuildMemberAdmin(member);
    });
};
/**
 * Test if a given {@link GuildMember} is an admin
 * @param guildMember Discord.js GuildMember
 * @returns Given guild member is admin
 */
export const isGuildMemberAdmin = function (guildMember) {
    // Return whether the GuildMember object exists, and whether the member has the Administrator permission
    return guildMember != null && guildMember.permissions.has(PermissionFlagsBits.Administrator);
};
/**
 * Given a mention or name, provide a {@link GuildMember} if any matching exist
 * @param userString Part of a username or nickname, or a complete user mention
 * @param guild Discord.js Guild
 * @returns A {@link GuildMember} if one existing matching query, otherwise null
 */
export const findGuildMember = (userString, guild) => __awaiter(void 0, void 0, void 0, function* () {
    // Try checking for a mention
    const userRx = userString.match(/^<@!(\d+)>$/);
    if (userRx != null) {
        return guild.members.cache.get(userRx[1]);
    }
    else {
        // Otherwise, try checking if it's a substring of nickname/username
        // Ensure the member cache is populated
        yield guild.members.fetch();
        return guild.members.cache.find(m => stringSearch(m.nickname, userString) ||
            stringSearch(m.user.username, userString));
    }
});
/**
 * Given a mention or name, provide a {@link GuildChannel} or {@link ThreadChannel} if any matching exist
 * @param channelString Part of a channel/thread name, or a complete channel/thread mention
 * @param guild Discord.js Guild
 * @returns A {@link GuildChannel} or {@link ThreadChannel}  if one existing matching query, otherwise null
 */
export const findGuildChannel = (channelString, guild) => __awaiter(void 0, void 0, void 0, function* () {
    // Try checking for a channel mention
    const channelRx = channelString.match(/^<#(\d+)>$/);
    if (channelRx != null) {
        return guild.channels.cache.get(channelRx[1]);
    }
    else {
        // Otherwise, try checking if it's a substring of channel name
        return guild.channels.cache.find(c => stringEquivalence(c.name, channelString));
    }
});
/**
 * Given a mention or name, provide a {@link Role} if any matching exist
 * @param channelString Part of a role name, or a complete role mention
 * @param guild Discord.js Guild
 * @returns A {@link Role} if one existing matching query, otherwise null
 */
export const findGuildRole = (roleString, guild) => __awaiter(void 0, void 0, void 0, function* () {
    // Try checking for a role mention
    const roleRx = roleString.match(/^<@&(\d+)>$/);
    if (roleRx != null) {
        return guild.roles.cache.get(roleRx[1]);
    }
    else {
        // Otherwise, try checking if it's a substring of role name
        return guild.roles.cache.find(r => stringEquivalence(r.name, roleString));
    }
});
//# sourceMappingURL=bot_utils.js.map