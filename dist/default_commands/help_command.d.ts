import { BotCommand } from "../bot.js";
import { CommandProvider } from "../command_provider.js";
export declare class HelpCommand implements CommandProvider {
    botName: string;
    helpMessage: string;
    constructor(botName: string, botHelpMessage: string, providers: CommandProvider[]);
    provideAliases(): string[];
    provideHelpMessage(): string;
    handle(command: BotCommand): Promise<void>;
    private generateHelpMessage;
}
