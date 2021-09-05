import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export type GeneralSlashCommandBuilder = SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

export interface CommandProvider { 
  // Return a string array of aliases handled
  provideSlashCommands(): GeneralSlashCommandBuilder[];
  // Return a help message for this command
  provideHelpMessage(): string;
  // Handle command call
  handle(interaction: CommandInteraction): Promise<void>;
}