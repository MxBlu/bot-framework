import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";
import { Interaction } from "discord.js";
export interface CommandProvider<T extends Interaction> { 
  // Return a string array of aliases handled
  provideSlashCommands(): RESTPostAPIApplicationCommandsJSONBody[];
  // Return a help message for this command
  provideHelpMessage(): string;
  // Handle command call
  handle(interaction: T): Promise<void>;
}