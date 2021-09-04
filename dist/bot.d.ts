import { Message, Client as DiscordClient, ClientOptions, BitFieldResolvable, IntentsString } from "discord.js";
import { CommandProvider } from "./command_provider.js";
import { Logger } from "./logger.js";
export declare type ClientOptionsWithoutIntents = Omit<ClientOptions, 'intents'>;
export declare class BotCommand {
    message: Message;
    command: string;
    arguments: string[];
}
export declare class BaseBot {
    name: string;
    discord: DiscordClient;
    logger: Logger;
    discordLogDisabled: boolean;
    providers: CommandProvider[];
    commandHandlers: Map<string, CommandProvider>;
    constructor(name: string);
    /**
     * Primary function in charge of launching the bot.
     * This should be run after addCommandHandlers() is called.
     * @param discordToken : Discord token received from the bot.
     */
    init(discordToken: string, intents: BitFieldResolvable<IntentsString, number>, discordClientOptions?: ClientOptionsWithoutIntents): Promise<void>;
    private initCommandHandlers;
    private initEventHandlers;
    initCustomEventHandlers(): void;
    loadProviders(): void;
    getHelpMessage(): string;
    private parseCommand;
    private readyHandler;
    private messageHandler;
    private logHandler;
}
