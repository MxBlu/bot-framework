import { Message, Client as DiscordClient, ClientOptions } from "discord.js";
import { CommandInterface } from "./commands/command_interface.js";
import { Logger } from "./logger.js";
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
    interfaces: CommandInterface[];
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
    private parseCommand;
    readyHandler: () => void;
    onReady(): Promise<void>;
    private messageHandler;
    private helpHandler;
    private errorLogHandler;
    getHelpMessage(): string;
}
