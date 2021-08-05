import { Message, Client as DiscordClient, ClientOptions } from "discord.js";
import { BotCommandHandlerFunction, CommandProvider } from "./command_provider.js";
import { Logger } from "./logger.js";
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
    providers: CommandProvider[];
    commandHandlers: Map<string, BotCommandHandlerFunction>;
    constructor(name: string);
    /**
     * Primary function in charge of launching the bot.
     * This should be run after addCommandHandlers() is called.
     * @param discordToken : Discord token received from the bot.
     */
    init(discordToken: string, discordClientOptions?: ClientOptions): Promise<void>;
    private initCommandHandlers;
    private initEventHandlers;
    initCustomEventHandlers(): void;
    loadInterfaces(): void;
    getHelpMessage(): string;
    private parseCommand;
    private readyHandler;
    private messageHandler;
    private errorLogHandler;
}
