import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
export declare type GeneralSlashCommandBuilder = SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
export interface CommandProvider {
    provideSlashCommands(): GeneralSlashCommandBuilder[];
    provideHelpMessage(): string;
    handle(interaction: CommandInteraction): Promise<void>;
}
