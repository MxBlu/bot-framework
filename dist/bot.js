var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Client as DiscordClient, GatewayIntentBits } from "discord.js";
import { Routes, ApplicationCommandType } from 'discord-api-types/v10';
import { sendMessage } from "./bot_utils.js";
import { DISCORD_ERROR_CHANNEL, DISCORD_ERROR_LOGGING_ENABLED, DISCORD_GENERAL_LOGGING_ENABLED, DISCORD_LOG_ERROR_STATUS_RESET, DISCORD_REGISTER_COMMANDS, DISCORD_REGISTER_COMMANDS_AS_GLOBAL } from "./constants/constants.js";
import { LogLevel } from "./constants/log_levels.js";
import { HelpCommand } from "./default_commands/help_command.js";
import { Logger, NewLogEmitter } from "./logger.js";
import { Cluster, ClusterDependency } from "./cluster.js";
/**
 * Base implementation of a Discord bot using the Discord.js framework
 */
export class DiscordBot {
    /**
     * Create an instance of a {@link DiscordBot}
     * @param name Bot name
     */
    constructor(name) {
        // Discord event handlers
        /**
         * Handle the `ready` Discord event
         */
        this.readyHandler = () => {
            this.logger.info("Discord connected");
            // Register commands with API and map handlers
            if (DISCORD_REGISTER_COMMANDS) {
                this.registerCommands();
            }
        };
        /**
         * Handle the `interactionCreate` Discord event
         * @param interaction Discord interaction
         */
        this.interactionHandler = (interaction) => __awaiter(this, void 0, void 0, function* () {
            // Only the cluster leader should handle commands
            if (!Cluster.isLeader()) {
                return;
            }
            // Ignore bot interactions to avoid messy situations
            if (interaction.user.bot) {
                return;
            }
            // Run any prep needed before handling the command interaction
            yield this.prepareCommandInteraction();
            if (interaction.isChatInputCommand()) {
                // Handle command interactions
                const commandInteraction = interaction;
                // If a handler exists for the commandName, handle the command
                const handler = this.chatCommandHandlers.get(commandInteraction.commandName);
                if (handler != null) {
                    this.logger.debug(`Command received from '${interaction.user.username}' in '${interaction.guild.name}': ` +
                        `!${interaction.commandName}'`);
                    handler.handle(commandInteraction);
                }
            }
            else if (interaction.isContextMenuCommand()) {
                // Handle command interactions
                const commandInteraction = interaction;
                // If a handler exists for the commandName, handle the command
                const handler = this.contextCommandHandlers.get(commandInteraction.commandName);
                if (handler != null) {
                    this.logger.debug(`Command received from '${interaction.user.username}' in '${interaction.guild.name}': ` +
                        `!${interaction.commandName}'`);
                    handler.handle(commandInteraction);
                }
            }
            else if (interaction.isAutocomplete()) {
                // Handle autocomplete interactions
                const commandInteraction = interaction;
                // If a handler exists for the commandName and has an autocomplete definition, process
                const handler = this.chatCommandHandlers.get(interaction.commandName);
                if (handler != null && handler.autocomplete != null) {
                    this.logger.trace(`Autcomplete request received from '${interaction.user.username}' in '${interaction.guild.name}': ` +
                        `!${interaction.commandName}'`);
                    handler.autocomplete(commandInteraction);
                }
            }
        });
        /**
         * Handle the `guildCreate` Discord event
         * @param guild New Discord Guild
         */
        this.guildCreateHandler = (guild) => __awaiter(this, void 0, void 0, function* () {
            // Only the cluster leader should potentially register commands
            if (!Cluster.isLeader()) {
                return;
            }
            // If we're registering commands under a guild, register every command on guild join
            if (!DISCORD_REGISTER_COMMANDS_AS_GLOBAL) {
                this.providers.forEach(provider => {
                    provider.provideCommands().forEach((command) => __awaiter(this, void 0, void 0, function* () {
                        const commandJson = command.toJSON();
                        try {
                            this.registerApplicationCommand(commandJson, guild.id);
                        }
                        catch (e) {
                            this.logger.error(`Failed to register command '${command.name}': ${e}`);
                        }
                    }));
                });
            }
        });
        /**
         * Handle a new log message event on {@link NewLogEmitter}
         * @param log Log message
         */
        this.logHandler = (log) => __awaiter(this, void 0, void 0, function* () {
            // Ensure that logging isn't currently disabled and that a error channel is present
            if (!this.discordLogDisabled && DISCORD_ERROR_CHANNEL != "") {
                try {
                    // Remove any consequtive spaces to make logs more legible
                    log = log.replace(/  +/, ' ');
                    // Should ensure that it works for DM channels too
                    const targetChannel = yield this.discord.channels.fetch(DISCORD_ERROR_CHANNEL);
                    // Only send if we can access the error channel
                    if (targetChannel != null && targetChannel.isTextBased()) {
                        sendMessage(targetChannel, log);
                    }
                }
                catch (e) {
                    // Trip error flag, prevents error logs hitting here again
                    this.discordLogDisabled = true;
                    this.logger.error(`Discord logging exception, disabling log: ${e}`);
                    // Reset error status after DISCORD_LOG_ERROR_STATUS_RESET ms
                    setTimeout(() => {
                        this.discordLogDisabled = false;
                        this.logger.debug("Discord logging re-enabled");
                    }, DISCORD_LOG_ERROR_STATUS_RESET);
                }
            }
        });
        this.name = name;
        this.logger = new Logger(name);
        this.discordLogDisabled = false;
        this.providers = [];
        this.chatCommandHandlers = new Map();
        this.contextCommandHandlers = new Map();
    }
    /**
     * Initialise the bot, and start listening and handling events
     *
     * Defaults to only the GUILDS intent, add more intents based on required events
     * @param discordToken Discord API token
     * @param intents Gateway intents, defaulting to GatewayIntentBits.Guilds
     * @param discordClientOptions Discord.js client options, excluding intents
     */
    init(discordToken, intents = [GatewayIntentBits.Guilds], discordClientOptions = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            yield ClusterDependency.await();
            // Create the Discord client
            this.discord = new DiscordClient(Object.assign(Object.assign({}, discordClientOptions), { intents }));
            // Initialise command handlers
            this.loadProviders();
            // Initialise default command handlers
            this.initDefaultCommandHandlers();
            // Initialise default event handlers
            this.initEventHandlers();
            // Initialise any custom event handlers (on subclasses)
            this.initCustomEventHandlers();
            // Login to Discord and start listening for events
            this.discord.login(discordToken);
        });
    }
    /**
     * Initialise and map all command handlers
     *
     * Runs after {@link loadProviders}
     */
    initDefaultCommandHandlers() {
        // Add help command, passing in all currently registered providers
        this.providers.push(new HelpCommand(this.name, this.getHelpMessage(), this.providers));
    }
    /**
     * Initialise all Discord event handlers
     *
     * Runs before {@link initCustomEventHandlers}
     */
    initEventHandlers() {
        this.discord.once('ready', this.readyHandler);
        this.discord.on('interactionCreate', this.interactionHandler);
        this.discord.on('error', err => this.logger.error(`Discord error: ${err}`));
        // If we're registering commands under a guild, register every command on guild join
        if (!DISCORD_REGISTER_COMMANDS_AS_GLOBAL && DISCORD_REGISTER_COMMANDS) {
            this.discord.on('guildCreate', this.guildCreateHandler);
        }
        // Subscribe to ERROR logs being published
        if (DISCORD_ERROR_LOGGING_ENABLED || DISCORD_GENERAL_LOGGING_ENABLED) {
            NewLogEmitter.on(LogLevel[LogLevel.ERROR], this.logHandler);
        }
        // If we have general logging enabled, send all logs to Discord
        if (DISCORD_GENERAL_LOGGING_ENABLED) {
            NewLogEmitter.on(LogLevel[LogLevel.INFO], this.logHandler);
            NewLogEmitter.on(LogLevel[LogLevel.WARN], this.logHandler);
            NewLogEmitter.on(LogLevel[LogLevel.DEBUG], this.logHandler);
            NewLogEmitter.on(LogLevel[LogLevel.TRACE], this.logHandler);
        }
    }
    /**
     * Register all command providers loaded as application commands
     */
    registerCommands() {
        // Only the cluster leader should register commands
        if (!Cluster.isLeader()) {
            return;
        }
        // Assign aliases to handler command for each provider 
        this.providers.forEach(provider => {
            provider.provideCommands().forEach((command) => __awaiter(this, void 0, void 0, function* () {
                const commandJson = command.toJSON();
                try {
                    // Based on the flag, either register commands globally
                    //  or on each guild currently available
                    if (DISCORD_REGISTER_COMMANDS_AS_GLOBAL) {
                        yield this.registerApplicationCommand(commandJson, null);
                    }
                    else {
                        yield Promise.all(this.discord.guilds.cache.map(guild => {
                            this.registerApplicationCommand(commandJson, guild.id);
                        }));
                    }
                    // Map command name to handler in a map based on its type
                    if (commandJson.type == ApplicationCommandType.Message || commandJson.type == ApplicationCommandType.User) {
                        this.contextCommandHandlers.set(command.name, provider);
                    }
                    else {
                        this.chatCommandHandlers.set(command.name, provider);
                    }
                }
                catch (e) {
                    this.logger.error(`Failed to register command '${command.name}': ${e}`);
                }
            }));
        });
    }
    /**
     * Subscribe to any extra events outside of the base ones
     *
     * For a subclass to override
     */
    initCustomEventHandlers() {
        // Stub function, subclass to override
        return;
    }
    /**
     * Add all providers to the providers array
     *
     * For a subclass to override
     */
    loadProviders() {
        // Stub function, subclass to override
        return;
    }
    /**
     * Return a string for the bot-level help message
     *
     * For a subclass to override
     */
    getHelpMessage() {
        throw new Error("Method not implemented");
    }
    /**
     * Perform actions before processing a command interaction
     *
     * For a subclass to override
     */
    prepareCommandInteraction() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    // Utility functions
    /**
     * Register an application command with the API
     *
     * Provide a Guild ID to register it to a Guild, or none to register it globally
     * @param command Application command definition
     * @param guildId Discord Guild ID, or null to register globally
     * @returns
     */
    registerApplicationCommand(command, guildId) {
        return __awaiter(this, void 0, void 0, function* () {
            // If guildId is set, register it as a guild command
            // Otherwise, register it as a global command
            let response = null;
            if (guildId != null) {
                response = (yield this.discord.rest.post(Routes.applicationGuildCommands(this.discord.application.id, guildId), { body: command }));
            }
            else {
                response = (yield this.discord.rest.post(Routes.applicationCommands(this.discord.application.id), { body: command }));
            }
            this.logger.debug(`Registered command '${command.name}' ${guildId == null ? 'globally' : `to guild '${guildId}'`}`);
            return response;
        });
    }
}
//# sourceMappingURL=bot.js.map