import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
export interface CommandProvider {
    provideSlashCommands(): SlashCommandBuilder[];
    provideHelpMessage(): string;
    handle(interaction: CommandInteraction): Promise<void>;
}
