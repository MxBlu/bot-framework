import { CommandInteraction, Interaction } from "discord.js";
import { CommandProvider, ModernApplicationCommandJSONBody } from "../command_provider.js";
export declare class HelpCommand implements CommandProvider<CommandInteraction> {
    botName: string;
    helpMessage: string;
    constructor(botName: string, botHelpMessage: string, providers: CommandProvider<Interaction>[]);
    provideSlashCommands(): ModernApplicationCommandJSONBody[];
    provideHelpMessage(): string;
    handle(interaction: CommandInteraction): Promise<void>;
    private generateHelpMessage;
}
