import { Message, Client as DiscordClient } from "discord.js";
import { Logger } from "./logger.js";
import { ScrollableModalManager } from "./scrollable.js";
export declare type BotCommandHandlerFunction = (command: BotCommand) => Promise<void>;
export declare class BotCommand {
    message: Message;
    command: string;
    arguments: string[];
}
export declare class BaseBot {
    name: string;
    discord: DiscordClient;
    logger: Logger;
    errLogDisabled: boolean;
    scrollableManager: ScrollableModalManager;
    commandHandlers: Map<string, BotCommandHandlerFunction>;
    constructor(name: string);
    init(discordToken: string): Promise<void>;
    initCommandHandlers(): void;
    initEventHandlers(): void;
    private parseCommand;
    readyHandler: () => void;
    onReady(): Promise<void>;
    private messageHandler;
    private helpHandler;
    private errorLogHandler;
    getHelpMessage(): string;
}
