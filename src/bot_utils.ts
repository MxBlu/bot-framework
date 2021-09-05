import { CommandInteraction, Guild, GuildChannel, GuildMember, Message, Role, TextBasedChannels, ThreadChannel } from "discord.js";

import { LogLevel } from "./constants/log_levels.js";
import { Logger } from "./logger.js";

const DISCORD_MAX_LEN = 1900;

// Split up a string into ideally endline terminated strings
// at most length DISCORD_MAX_LEN
export const chunkString = function (str: string): string[] {
  const chunks: string[] = [];
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
    } else if (strBuffer.length + s.length + 1 > DISCORD_MAX_LEN) {
      chunks.push(strBuffer);
      strBuffer = s + "\n";
    // Otherwise, add the string the the buffer
    } else {
      strBuffer += s + "\n";
    }
  });

  // Flush the buffer again
  if (strBuffer.length > 0) {
    chunks.push(strBuffer);
    strBuffer = '';
  }

  return chunks;
}

// Send reply to a user command, logging if appropriate
export const sendCmdReply = async function (interaction: CommandInteraction, msg: string, 
    logger: Logger, level: LogLevel): Promise<void> {
  logger.log(`${interaction.user.username} - ${interaction.guild.name} - ${msg}`, level);
  return sendChunkedReply(interaction, msg);
}

// Send reply to a user command which may potentially be large
export const sendChunkedReply = async function (interaction: CommandInteraction, msg: string)
    : Promise<void> {
  // Split up message into max length chunks
  const msgChunks = chunkString(msg);
  // Send first message as a reply
  // If the interaction has been deferred, edit the reply instead of creating a new one
  if (interaction.deferred) {
    await interaction.editReply({ content: msgChunks.shift() });
  } else {
    await interaction.reply({ content: msgChunks.shift() });
  }
  // Send subsequent messages as follow-ups
  for (const chunk of msgChunks) {
    await interaction.followUp({ content: chunk });
  }
};

// Send message to a given channel, chunking if necessary
export const sendMessage = function (targetChannel: TextBasedChannels, 
    msg: string): void {
  const msgChunks = chunkString(msg);
  msgChunks.forEach(
    (chunk) => targetChannel.send(chunk));
}

// Compare 2 strings ignoring case 
// Return true if they're equivalent
// Returns true if both strings are null, otherwise 
// return false if either are null
export const stringEquivalence = function (str1: string, str2: string): boolean {
  if (str1 === null || str2 == null) {
    return str1 == str2;
  }

  return str1.toLowerCase() === str2.toLowerCase();
}

// Search for str2 in str1 ignoring case
// Returns true if both strings are null, otherwise 
// return false if either are null
export const stringSearch = function(str1: string, str2: string): boolean {
  if (str1 === null || str2 == null) {
    return str1 == str2;
  }

  return str1.toLowerCase().includes(str2.toLowerCase());
}

// Test if the author of a given message is admin
export const isAdmin = async function(message: Message): Promise<boolean> {
  const author = await message.guild.members.fetch(message.author.id);
  return author.permissions.has("ADMINISTRATOR");
}

// Given a mention or name, provide a GuildMember if any exist matching
export const findGuildMember = async (userString: string, guild: Guild): Promise<GuildMember> => {
  // Try checking for a mention
  const userRx = userString.match(/^<@!(\d+)>$/);
  if (userRx != null) {
    return guild.members.cache.get(userRx[1]);
  } else {
    // Otherwise, try checking if it's a substring of nickname/username
    // Ensure the member cache is populated
    await guild.members.fetch();
    return guild.members.cache.find(
          m => stringSearch(m.nickname, userString) || 
              stringSearch(m.user.username, userString));
  }
}

// Given a mention or name, provide a GuildMember if any exist matching
export const findGuildChannel = async (channelString: string, guild: Guild): Promise<ThreadChannel | GuildChannel> => {
  // Try checking for a channel mention
  const channelRx = channelString.match(/^<#(\d+)>$/);
  if (channelRx != null) {
    return guild.channels.cache.get(channelRx[1]);
  } else {
    // Otherwise, try checking if it's a substring of channel name
    return guild.channels.cache.find(c => stringEquivalence(c.name, channelString));
  }
}

export const findGuildRole = async (roleString: string, guild: Guild): Promise<Role> => {
  // Try checking for a role mention
  const roleRx = roleString.match(/^<@&(\d+)>$/);
  if (roleRx != null) {
    return guild.roles.cache.get(roleRx[1]);
  } else {
    // Otherwise, try checking if it's a substring of role name
    return guild.roles.cache.find(r => stringEquivalence(r.name, roleString));
  }
}