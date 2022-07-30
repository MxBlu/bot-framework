import { Client as DiscordClient, ClientOptions, Interaction, CommandInteraction, Guild, BitFieldResolvable, AutocompleteInteraction, GatewayIntentsString, GatewayIntentBits, ChatInputCommandInteraction, ContextMenuCommandInteraction } from "discord.js";
import { RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIApplicationCommandsResult, RESTPostAPIApplicationGuildCommandsResult, Routes, ApplicationCommandType } from 'discord-api-types/v10';

import { sendMessage } from "./bot_utils.js";
import { CommandBuilder, CommandProvider } from "./command_provider.js";
import { DISCORD_ERROR_CHANNEL, DISCORD_ERROR_LOGGING_ENABLED, DISCORD_GENERAL_LOGGING_ENABLED, DISCORD_LOG_ERROR_STATUS_RESET, DISCORD_REGISTER_COMMANDS, DISCORD_REGISTER_COMMANDS_AS_GLOBAL } from "./constants/constants.js";
import { LogLevel } from "./constants/log_levels.js";
import { HelpCommand } from "./default_commands/help_command.js";
import { Logger, NewLogEmitter } from "./logger.js";

/**
 * Discord.js ClientOptions type, but without the `intents` property
 * 
 * This is to allow having "default intents".
 */
export type ClientOptionsWithoutIntents = Omit<ClientOptions, 'intents'>;

/**
 * Base implementation of a Discord bot using the Discord.js framework
 */
export class DiscordBot {
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
  constructor(name: string) {
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
   * @param intents Gateway intents, defaulting to {@link GatewayIntentBits.Guilds}
   * @param discordClientOptions Discord.js client options, excluding intents
   */
  public async init(discordToken: string, 
      intents: BitFieldResolvable<GatewayIntentsString, number> = [ GatewayIntentBits.Guilds ], 
      discordClientOptions: ClientOptionsWithoutIntents = {}): Promise<void> {
    // Create the Discord client
    this.discord = new DiscordClient({
      ...discordClientOptions,
      intents
    });

    // Initialise command handlers, then event handlers
    this.initCommandHandlers();
    this.initEventHandlers();

    // Login to Discord and start listening for events
    this.discord.login(discordToken);
  }

  /** 
   * Initialise and map all command handlers
   * 
   * Runs after {@link loadProviders} 
   */
  private initCommandHandlers(): void {
    // Load in any subclass interfaces
    this.loadProviders();

    // Add help command, passing in all currently registered providers
    this.providers.push(new HelpCommand(this.name, this.getHelpMessage(), this.providers));
  }

  /**
   * Initialise all Discord event handlers
   * 
   * Runs before {@link initCustomEventHandlers}
   */
  private initEventHandlers(): void {
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

    // Initialise any custom event handlers (on subclasses)
    this.initCustomEventHandlers();
  }
  

  /**
   * Register all command providers loaded as application commands
   */
  private registerCommands(): void {
    // Assign aliases to handler command for each provider 
    this.providers.forEach(provider => {
      provider.provideCommands().forEach(async (command: CommandBuilder): Promise<void> => {
        const commandJson = command.toJSON();
        try {
          // Based on the flag, either register commands globally
          //  or on each guild currently available
          if (DISCORD_REGISTER_COMMANDS_AS_GLOBAL) {
            await this.registerApplicationCommand(commandJson, null);
          } else {
            await Promise.all(
              this.discord.guilds.cache.map(guild => {
                this.registerApplicationCommand(commandJson, guild.id);
              })
            );
          }

          // Map command name to handler in a map based on its type
          if (commandJson.type == ApplicationCommandType.ChatInput) {
            this.chatCommandHandlers.set(command.name, provider);
          } else {
            this.contextCommandHandlers.set(command.name, provider);
          }
        } catch (e) {
          this.logger.error(`Failed to register command '${command.name}': ${e}`);
        }
      });
    });
  }

  /**
   * Subscribe to any extra events outside of the base ones
   * 
   * For a subclass to override
   */
  public initCustomEventHandlers(): void {
    // Stub function, subclass to override
    return;
  }

  /**
   * Add all providers to the providers array
   * 
   * For a subclass to override
   */
  public loadProviders(): void {
    // Stub function, subclass to override
    return;
  }

  /**
   * Return a string for the bot-level help message
   * 
   * For a subclass to override
   */
  public getHelpMessage(): string {
    throw new Error("Method not implemented");
  }

  // Discord event handlers

  /**
   * Handle the `ready` Discord event 
   */
  private readyHandler = (): void => {
    this.logger.info("Discord connected");

    // Register commands with API and map handlers
    if (DISCORD_REGISTER_COMMANDS) {
      this.registerCommands();
    }
  }

  /**
   * Handle the `interactionCreate` Discord event
   * @param interaction Discord interaction
   */
  private interactionHandler = async (interaction: Interaction): Promise<void> => {
    // Ignore bot interactiosn to avoid messy situations
    if (interaction.user.bot) {
      return;
    }

    if (interaction.isChatInputCommand()) {
      // Handle command interactions
      const commandInteraction = <ChatInputCommandInteraction> interaction;

      // If a handler exists for the commandName, handle the command
      const handler = this.chatCommandHandlers.get(commandInteraction.commandName);
      if (handler != null) {
        this.logger.debug(`Command received from '${interaction.user.username}' in '${interaction.guild.name}': ` +
          `!${interaction.commandName}'`);
        handler.handle(commandInteraction);
      }
    } else if (interaction.isContextMenuCommand()) {
      // Handle command interactions
      const commandInteraction = <ContextMenuCommandInteraction> interaction;

      // If a handler exists for the commandName, handle the command
      const handler = this.contextCommandHandlers.get(commandInteraction.commandName);
      if (handler != null) {
        this.logger.debug(`Command received from '${interaction.user.username}' in '${interaction.guild.name}': ` +
          `!${interaction.commandName}'`);
        handler.handle(commandInteraction);
      }
    } else if (interaction.isAutocomplete()) {
      // Handle autocomplete interactions
      const commandInteraction = <AutocompleteInteraction> interaction;

      // If a handler exists for the commandName and has an autocomplete definition, process
      const handler = this.chatCommandHandlers.get(interaction.commandName);
      if (handler != null && handler.autocomplete != null) {
        this.logger.trace(`Autcomplete request received from '${interaction.user.username}' in '${interaction.guild.name}': ` +
          `!${interaction.commandName}'`);
        handler.autocomplete(commandInteraction);
      }
    }
  }

  /**
   * Handle the `guildCreate` Discord event
   * @param guild New Discord Guild
   */
  private guildCreateHandler = async (guild: Guild): Promise<void> => {
    // If we're registering commands under a guild, register every command on guild join
    if (!DISCORD_REGISTER_COMMANDS_AS_GLOBAL) {
      this.providers.forEach(provider => {
        provider.provideCommands().forEach(async (command: CommandBuilder): Promise<void> => {
          const commandJson = command.toJSON();
          try {
            this.registerApplicationCommand(commandJson, guild.id);
          } catch (e) {
            this.logger.error(`Failed to register command '${command.name}': ${e}`);
          }
        });
      });
    }
  }

  /**
   * Handle a new log message event on {@link NewLogEmitter}
   * @param log Log message
   */
  private logHandler = async (log: string): Promise<void> => {
    // Ensure that logging isn't currently disabled and that a error channel is present
    if (!this.discordLogDisabled && DISCORD_ERROR_CHANNEL != "") {
      try {
        // Remove any consequtive spaces to make logs more legible
        log = log.replace(/  +/, ' ');
        // Should ensure that it works for DM channels too
        const targetChannel = await this.discord.channels.fetch(DISCORD_ERROR_CHANNEL);
        // Only send if we can access the error channel
        if (targetChannel != null && targetChannel.isTextBased()) {
          sendMessage(targetChannel, log);
        }
      } catch (e) {
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
  public async registerApplicationCommand(
      command: RESTPostAPIApplicationCommandsJSONBody, guildId: string | null): 
      Promise<RESTPostAPIApplicationCommandsResult | RESTPostAPIApplicationGuildCommandsResult> {
    // If guildId is set, register it as a guild command
    // Otherwise, register it as a global command
    let response: RESTPostAPIApplicationCommandsResult | RESTPostAPIApplicationGuildCommandsResult = null;

    if (guildId != null) {
      response = await this.discord.rest.post(
        Routes.applicationGuildCommands(this.discord.application.id, guildId),
        { body: command }
      ) as RESTPostAPIApplicationGuildCommandsResult;
    } else {
      response = await this.discord.rest.post(
        Routes.applicationCommands(this.discord.application.id),
        { body: command }
      ) as RESTPostAPIApplicationCommandsResult;
    }

    this.logger.debug(`Registered command '${command.name}' ${guildId == null ? 'globally' : `to guild '${guildId}'`}`);
    return response;
  }

}