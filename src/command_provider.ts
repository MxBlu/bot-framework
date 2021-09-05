import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export interface CommandProvider { 
  // Return a string array of aliases handled
  provideSlashCommands(): SlashCommandBuilder[];
  // Return a help message for this command
  provideHelpMessage(): string;
  // Handle command call
  handle(interaction: CommandInteraction): Promise<void>;
}