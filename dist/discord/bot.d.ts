import { Client as DiscordClient, ClientOptions, Interaction, CommandInteraction, Guild, BitFieldResolvable, GatewayIntentsString, ChatInputCommandInteraction, ContextMenuCommandInteraction } from "discord.js";
import { RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIApplicationCommandsResult, RESTPostAPIApplicationGuildCommandsResult } from 'discord-api-types/v10';
import { Logger } from "./../logger.js";
import { CommandProvider } from "./command_provider.js";
/**
 * Discord.js ClientOptions type, but without the `intents` property
 *
 * This is to allow having "default intents".
 */
export type ClientOptionsWithoutIntents = Omit<ClientOptions, 'intents'>;
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
    protected initDefaultCommandHandlers(): void;
    /**
     * Initialise all Discord event handlers
     *
     * Runs before {@link initCustomEventHandlers}
     */
    protected initEventHandlers(): void;
    /**
     * Register all command providers loaded as application commands
     */
    protected registerCommands(): void;
    /**
     * Subscribe to any extra events outside of the base ones
     *
     * For a subclass to override
     */
    protected initCustomEventHandlers(): void;
    /**
     * Add all providers to the providers array
     *
     * For a subclass to override
     */
    protected loadProviders(): void;
    /**
     * Return a string for the bot-level help message
     *
     * For a subclass to override
     */
    protected getHelpMessage(): string;
    /**
     * Perform actions before processing a command interaction
     *
     * For a subclass to override
     */
    protected prepareCommandInteraction(): Promise<void>;
    /**
     * Handle the `ready` Discord event
     */
    protected readyHandler(): void;
    /**
     * Handle the `interactionCreate` Discord event
     * @param interaction Discord interaction
     */
    protected interactionHandler(interaction: Interaction): Promise<void>;
    /**
     * Handle the `guildCreate` Discord event
     * @param guild New Discord Guild
     */
    protected guildCreateHandler(guild: Guild): Promise<void>;
    /**
     * Handle a new log message event on {@link NewLogEmitter}
     * @param log Log message
     */
    protected logHandler(log: string): Promise<void>;
    /**
     * Register an application command with the API
     *
     * Provide a Guild ID to register it to a Guild, or none to register it globally
     * @param command Application command definition
     * @param guildId Discord Guild ID, or null to register globally
     * @returns
     */
    protected registerApplicationCommand(command: RESTPostAPIApplicationCommandsJSONBody, guildId: string | null): Promise<RESTPostAPIApplicationCommandsResult | RESTPostAPIApplicationGuildCommandsResult>;
}
