import { CommandInteraction } from "discord.js";
import { CommandProvider, GeneralSlashCommandBuilder } from "../command_provider.js";
export declare class HelpCommand implements CommandProvider {
    botName: string;
    helpMessage: string;
    constructor(botName: string, botHelpMessage: string, providers: CommandProvider[]);
    provideSlashCommands(): GeneralSlashCommandBuilder[];
    provideHelpMessage(): string;
    handle(interaction: CommandInteraction): Promise<void>;
    private generateHelpMessage;
}
