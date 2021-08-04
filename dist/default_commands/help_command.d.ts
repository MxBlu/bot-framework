import { BotCommand } from "../bot.js";
export declare class HelpCommand {
    botName: string;
    helpMessage: string;
    constructor(botName: string, helpMessage: string);
    provideAliases(): string[];
    handle(command: BotCommand): Promise<void>;
}
