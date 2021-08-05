import { BotCommand } from "./bot.js";
export declare type BotCommandHandlerFunction = (command: BotCommand) => Promise<void>;
export interface CommandProvider {
    provideAliases(): string[];
    provideHelpMessage(): string;
    handle(command: BotCommand): Promise<void>;
}
