import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { CommandProvider } from "../command_provider.js";
export declare class HelpCommand implements CommandProvider {
    botName: string;
    helpMessage: string;
    constructor(botName: string, botHelpMessage: string, providers: CommandProvider[]);
    provideSlashCommands(): SlashCommandBuilder[];
    provideHelpMessage(): string;
    handle(interaction: CommandInteraction): Promise<void>;
    private generateHelpMessage;
}
