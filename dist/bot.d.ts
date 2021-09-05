import { Client as DiscordClient, ClientOptions, BitFieldResolvable, IntentsString } from "discord.js";
import { REST } from '@discordjs/rest';
import { RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIApplicationCommandsResult, RESTPostAPIApplicationGuildCommandsResult } from 'discord-api-types/v9';
import { CommandProvider } from "./command_provider.js";
import { Logger } from "./logger.js";
export declare type ClientOptionsWithoutIntents = Omit<ClientOptions, 'intents'>;
export declare const enum ApplicationCommandType {
    CHAT_INPUT = 1,
    USER = 2,
    MESSAGE = 3
}
export declare type ModernApplicationCommandJSONBody = RESTPostAPIApplicationCommandsJSONBody & {
    type?: ApplicationCommandType;
};
export declare class BaseBot {
    name: string;
    discord: DiscordClient;
    discordRest: REST;
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
    init(discordToken: string, intents?: BitFieldResolvable<IntentsString, number>, discordClientOptions?: ClientOptionsWithoutIntents): Promise<void>;
    private initCommandHandlers;
    private initEventHandlers;
    private registerSlashCommands;
    initCustomEventHandlers(): void;
    loadProviders(): void;
    getHelpMessage(): string;
    registerApplicationCommand(command: ModernApplicationCommandJSONBody, guildId: string): Promise<RESTPostAPIApplicationCommandsResult | RESTPostAPIApplicationGuildCommandsResult>;
    private readyHandler;
    private interactionHandler;
    private guildCreateHandler;
    private logHandler;
}
