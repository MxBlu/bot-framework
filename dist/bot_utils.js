var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const DISCORD_MAX_LEN = 1900;
// Split up a string into ideally endline terminated strings
// at most length DISCORD_MAX_LEN
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
// Send reply to a user command, logging if appropriate
export const sendCmdReply = function (interaction, msg, logger, level) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.log(`${interaction.user.username} - ${interaction.guild.name} - ${msg}`, level);
        return interaction.reply({ content: msg });
    });
};
// Send message to a given channel, chunking if necessary
export const sendMessage = function (targetChannel, msg) {
    const msgChunks = chunkString(msg);
    msgChunks.forEach((chunk) => targetChannel.send(chunk));
};
// Compare 2 strings ignoring case 
// Return true if they're equivalent
// Returns true if both strings are null, otherwise 
// return false if either are null
export const stringEquivalence = function (str1, str2) {
    if (str1 === null || str2 == null) {
        return str1 == str2;
    }
    return str1.toLowerCase() === str2.toLowerCase();
};
// Search for str2 in str1 ignoring case
// Returns true if both strings are null, otherwise 
// return false if either are null
export const stringSearch = function (str1, str2) {
    if (str1 === null || str2 == null) {
        return str1 == str2;
    }
    return str1.toLowerCase().includes(str2.toLowerCase());
};
// Test if the author of a given message is admin
export const isAdmin = function (message) {
    return __awaiter(this, void 0, void 0, function* () {
        const author = yield message.guild.members.fetch(message.author.id);
        return author.permissions.has("ADMINISTRATOR");
    });
};
// Given a mention or name, provide a GuildMember if any exist matching
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
// Given a mention or name, provide a GuildMember if any exist matching
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