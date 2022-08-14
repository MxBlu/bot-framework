import { Client as DiscordClient, ClientOptions, CommandInteraction, BitFieldResolvable, GatewayIntentsString, ChatInputCommandInteraction, ContextMenuCommandInteraction } from "discord.js";
import { RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIApplicationCommandsResult, RESTPostAPIApplicationGuildCommandsResult } from 'discord-api-types/v10';
import { CommandProvider } from "./command_provider.js";
import { Logger } from "./logger.js";
/**
 * Discord.js ClientOptions type, but without the `intents` property
 *
 * This is to allow having "default intents".
 */
export declare type ClientOptionsWithoutIntents = Omit<ClientOptions, 'intents'>;
/**
 * Base implementation of a Discord bot using the Discord.js framework
 */
export declare class DiscordBot {
    /** Bot name */
    name: string;
    /** Discord.js client */
    discord: DiscordClient;
    /** Logger instance */
    logger: Logger;
    /**
     * Whether to log to Discord or not.
     *
     * Used to temporarily disable logging when encountering an error logging to Discord.
     */
    discordLogDisabled: boolean;
    /** Command interfaces that provide handlers */
    providers: CommandProvider<CommandInteraction>[];
    /** Maps of command names to handlers */
    chatCommandHandlers: Map<string, CommandProvider<ChatInputCommandInteraction>>;
    contextCommandHandlers: Map<string, CommandProvider<ContextMenuCommandInteraction>>;
    /**
     * Create an instance of a {@link DiscordBot}
     * @param name Bot name
     */
    constructor(name: string);
    /**
     * Initialise the bot, and start listening and handling events
     *
     * Defaults to only the GUILDS intent, add more intents based on required events
     * @param discordToken Discord API token
     * @param intents Gateway intents, defaulting to GatewayIntentBits.Guilds
     * @param discordClientOptions Discord.js client options, excluding intents
     */
    init(discordToken: string, intents?: BitFieldResolvable<GatewayIntentsString, number>, discordClientOptions?: ClientOptionsWithoutIntents): Promise<void>;
    /**
     * Initialise and map all command handlers
     *
     * Runs after {@link loadProviders}
     */
    private initCommandHandlers;
    /**
     * Initialise all Discord event handlers
     *
     * Runs before {@link initCustomEventHandlers}
     */
    private initEventHandlers;
    /**
     * Register all command providers loaded as application commands
     */
    private registerCommands;
    /**
     * Subscribe to any extra events outside of the base ones
     *
     * For a subclass to override
     */
    initCustomEventHandlers(): void;
    /**
     * Add all providers to the providers array
     *
     * For a subclass to override
     */
    loadProviders(): void;
    /**
     * Return a string for the bot-level help message
     *
     * For a subclass to override
     */
    getHelpMessage(): string;
    /**
     * Handle the `ready` Discord event
     */
    private readyHandler;
    /**
     * Handle the `interactionCreate` Discord event
     * @param interaction Discord interaction
     */
    private interactionHandler;
    /**
     * Handle the `guildCreate` Discord event
     * @param guild New Discord Guild
     */
    private guildCreateHandler;
    /**
     * Handle a new log message event on {@link NewLogEmitter}
     * @param log Log message
     */
    private logHandler;
    /**
     * Register an application command with the API
     *
     * Provide a Guild ID to register it to a Guild, or none to register it globally
     * @param command Application command definition
     * @param guildId Discord Guild ID, or null to register globally
     * @returns
     */
    registerApplicationCommand(command: RESTPostAPIApplicationCommandsJSONBody, guildId: string | null): Promise<RESTPostAPIApplicationCommandsResult | RESTPostAPIApplicationGuildCommandsResult>;
}
