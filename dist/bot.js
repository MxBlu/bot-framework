var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Client as DiscordClient } from "discord.js";
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { sendMessage } from "./bot_utils.js";
import { DISCORD_ERROR_CHANNEL, DISCORD_ERROR_LOGGING_ENABLED, DISCORD_GENERAL_LOGGING_ENABLED, DISCORD_LOG_ERROR_STATUS_RESET, DISCORD_REGISTER_COMMANDS, DISCORD_REGISTER_COMMANDS_AS_GLOBAL } from "./constants/constants.js";
import { LogLevel } from "./constants/log_levels.js";
import { HelpCommand } from "./default_commands/help_command.js";
import { Logger, NewLogEmitter } from "./logger.js";
export class BaseBot {
    constructor(name) {
        // Discord event handlers
        this.readyHandler = () => {
            this.logger.info("Discord connected");
            // Register commands with API and map handlers
            if (DISCORD_REGISTER_COMMANDS) {
                this.registerCommands();
            }
        };
        this.interactionHandler = (interaction) => __awaiter(this, void 0, void 0, function* () {
            // Ignore bot interactiosn to avoid messy situations
            if (interaction.user.bot) {
                return;
            }
            if (interaction.isCommand()) {
                // Handle command interactions
                const commandInteraction = interaction;
                // If a handler exists for the commandName, handle the command
                const handler = this.slashCommandHandlers.get(commandInteraction.commandName);
                if (handler != null) {
                    this.logger.debug(`Command received from '${interaction.user.username}' in '${interaction.guild.name}': ` +
                        `!${interaction.commandName}'`);
                    handler.handle(commandInteraction);
                }
            }
            else if (interaction.isContextMenu()) {
                // Handle context menu interactions
                const contextInteraction = interaction;
                // If a handler exists for the commandName, handle the command
                const handler = this.contextCommandHandlers.get(contextInteraction.commandName);
                if (handler != null) {
                    this.logger.debug(`Command received from '${interaction.user.username}' in '${interaction.guild.name}': ` +
                        `!${interaction.commandName}'`);
                    handler.handle(contextInteraction);
                }
            }
        });
        this.guildCreateHandler = (guild) => __awaiter(this, void 0, void 0, function* () {
            // If we're registering commands under a guild, register every command on guild join
            if (!DISCORD_REGISTER_COMMANDS_AS_GLOBAL) {
                this.providers.forEach(provider => {
                    provider.provideSlashCommands().forEach((command) => __awaiter(this, void 0, void 0, function* () {
                        // Default type to CHAT_INPUT - aka a slash command
                        if (command.type == null) {
                            command.type = 1 /* CHAT_INPUT */;
                        }
                        try {
                            this.registerApplicationCommand(command, guild.id);
                        }
                        catch (e) {
                            this.logger.error(`Failed to register command '${command.name}': ${e}`);
                        }
                    }));
                });
            }
        });
        // Log message handler
        this.logHandler = (log) => __awaiter(this, void 0, void 0, function* () {
            if (!this.discordLogDisabled && DISCORD_ERROR_CHANNEL != "") {
                try {
                    // Remove any consequtive spaces to make logs more legible
                    log = log.replace(/  +/, ' ');
                    // Should ensure that it works for DM channels too
                    const targetChannel = yield this.discord.channels.fetch(DISCORD_ERROR_CHANNEL);
                    // Only send if we can access the error channel
                    if (targetChannel != null && targetChannel.isText()) {
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
        this.slashCommandHandlers = new Map();
        this.contextCommandHandlers = new Map();
    }
    /**
     * Primary function in charge of launching the bot.
     * This should be run after addCommandHandlers() is called.
     * @param discordToken : Discord token received from the bot.
     */
    init(discordToken, intents = ["GUILDS", "GUILD_MESSAGES"], discordClientOptions = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            this.discord = new DiscordClient(Object.assign(Object.assign({}, discordClientOptions), { intents }));
            this.discordRest = new REST({ version: '9' }).setToken(discordToken);
            this.initCommandHandlers();
            this.initEventHandlers();
            this.discord.login(discordToken);
        });
    }
    // Initialise and map all command handlers
    // Runs after loadProviders()
    initCommandHandlers() {
        // Load in any subclass interfaces
        this.loadProviders();
        // Add help command, passing in all currently registered providers (help is not yet registered)
        this.providers.push(new HelpCommand(this.name, this.getHelpMessage(), this.providers));
    }
    // Initialise all event handlers
    // Runs before initCustomEventHandlers()
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
        this.initCustomEventHandlers();
    }
    // Register all command providers loaded as slash commands
    // Runs after readyhandler()
    registerCommands() {
        // Assign aliases to handler command for each provider 
        this.providers.forEach(provider => {
            provider.provideSlashCommands().forEach((command) => __awaiter(this, void 0, void 0, function* () {
                // Default type to CHAT_INPUT - aka a slash command
                if (command.type == null) {
                    command.type = 1 /* CHAT_INPUT */;
                }
                try {
                    // Based on the flag, either register commands globally
                    //  or on each guild currently available
                    if (DISCORD_REGISTER_COMMANDS_AS_GLOBAL) {
                        yield this.registerApplicationCommand(command, null);
                    }
                    else {
                        yield Promise.all(this.discord.guilds.cache.map(guild => {
                            this.registerApplicationCommand(command, guild.id);
                        }));
                    }
                    // Map command name to handler
                    if (command.type == 1 /* CHAT_INPUT */) {
                        this.slashCommandHandlers.set(command.name, provider);
                    }
                    else {
                        this.contextCommandHandlers.set(command.name, provider);
                    }
                }
                catch (e) {
                    this.logger.error(`Failed to register command '${command.name}': ${e}`);
                }
            }));
        });
    }
    // Subscribe to any extra events outside of the base ones
    initCustomEventHandlers() {
        // Stub function, subclass to override
        return;
    }
    // Add all providers to the providers array
    loadProviders() {
        // Stub function, subclass to override
        return;
    }
    // Return a string for the bot-level help message
    getHelpMessage() {
        throw new Error("Method not implemented");
    }
    // Utility functions
    // Register a slash command with the API
    // If guildId is null, command is registered as a global command
    registerApplicationCommand(command, guildId) {
        return __awaiter(this, void 0, void 0, function* () {
            // If guildId is set, register it as a guild command
            // Otherwise, register it as a global command
            let response = null;
            if (guildId != null) {
                response = (yield this.discordRest.post(Routes.applicationGuildCommands(this.discord.application.id, guildId), { body: command }));
            }
            else {
                response = (yield this.discordRest.post(Routes.applicationCommands(this.discord.application.id), { body: command }));
            }
            this.logger.debug(`Registered command '${command.name}' ${guildId == null ? 'globally' : `to guild '${guildId}'`}`);
            return response;
        });
    }
}
//# sourceMappingURL=bot.js.map