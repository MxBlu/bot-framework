import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";
import { Interaction } from "discord.js";

// Temporary types while waiting for discord-api-types to add new types in
export const enum ApplicationCommandType {
  CHAT_INPUT = 1,
  USER = 2,
  MESSAGE = 3
}
export type ModernApplicationCommandJSONBody = RESTPostAPIApplicationCommandsJSONBody & { type?: ApplicationCommandType };

export interface CommandProvider<T extends Interaction> { 
  // Return a string array of aliases handled
  provideSlashCommands(): ModernApplicationCommandJSONBody[];
  // Return a help message for this command
  provideHelpMessage(): string;
  // Handle command call
  handle(interaction: T): Promise<void>;
}