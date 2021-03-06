import { Client as DiscordClient, ClientOptions, IntentsString, Interaction, CommandInteraction, ContextMenuInteraction, BitFieldResolvable } from "discord.js";
import { REST } from '@discordjs/rest';
import { RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIApplicationCommandsResult, RESTPostAPIApplicationGuildCommandsResult } from 'discord-api-types/v9';
import { CommandProvider } from "./command_provider.js";
import { Logger } from "./logger.js";
export declare type ClientOptionsWithoutIntents = Omit<ClientOptions, 'intents'>;
export declare class BaseBot {
    name: string;
    discord: DiscordClient;
    discordRest: REST;
    logger: Logger;
    discordLogDisabled: boolean;
    providers: CommandProvider<Interaction>[];
    slashCommandHandlers: Map<string, CommandProvider<CommandInteraction>>;
    contextCommandHandlers: Map<string, CommandProvider<ContextMenuInteraction>>;
    constructor(name: string);
    /**
     * Primary function in charge of launching the bot.
     * This should be run after addCommandHandlers() is called.
     * @param discordToken : Discord token received from the bot.
     */
    init(discordToken: string, intents?: BitFieldResolvable<IntentsString, number>, discordClientOptions?: ClientOptionsWithoutIntents): Promise<void>;
    private initCommandHandlers;
    private initEventHandlers;
    private registerCommands;
    initCustomEventHandlers(): void;
    loadProviders(): void;
    getHelpMessage(): string;
    private readyHandler;
    private interactionHandler;
    private guildCreateHandler;
    private logHandler;
    registerApplicationCommand(command: RESTPostAPIApplicationCommandsJSONBody, guildId: string): Promise<RESTPostAPIApplicationCommandsResult | RESTPostAPIApplicationGuildCommandsResult>;
}
