import { Client as DiscordClient, ClientOptions, IntentsString, Interaction, CommandInteraction, Guild, ContextMenuInteraction, BitFieldResolvable, Intents, AutocompleteInteraction } from "discord.js";
import { REST } from '@discordjs/rest';
import { ApplicationCommandType, RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIApplicationCommandsResult, RESTPostAPIApplicationGuildCommandsResult, Routes } from 'discord-api-types/v9';

import { sendMessage } from "./bot_utils.js";
import { CommandProvider } from "./command_provider.js";
import { DISCORD_ERROR_CHANNEL, DISCORD_ERROR_LOGGING_ENABLED, DISCORD_GENERAL_LOGGING_ENABLED, DISCORD_LOG_ERROR_STATUS_RESET, DISCORD_REGISTER_COMMANDS, DISCORD_REGISTER_COMMANDS_AS_GLOBAL } from "./constants/constants.js";
import { LogLevel } from "./constants/log_levels.js";
import { HelpCommand } from "./default_commands/help_command.js";
import { Logger, NewLogEmitter } from "./logger.js";

export type ClientOptionsWithoutIntents = Omit<ClientOptions, 'intents'>;

export class BaseBot {
  // Bot name
  name: string;
  // Discord client
  discord: DiscordClient;
  // Discord REST client
  discordRest: REST;
  // Logger instance
  logger: Logger;

  // For when we hit an error logging to Discord itself
  discordLogDisabled: boolean;
  // Command interfaces that provide handlers
  providers: CommandProvider<Interaction>[];
  // Map of command names to handlers
  slashCommandHandlers: Map<string, CommandProvider<CommandInteraction>>;
  // Map of command names to context menu handlers
  contextCommandHandlers: Map<string, CommandProvider<ContextMenuInteraction>>;

  constructor(name: string) {
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
  public async init(discordToken: string, 
      intents: BitFieldResolvable<IntentsString, number> = [ Intents.FLAGS.GUILDS ], 
      discordClientOptions: ClientOptionsWithoutIntents = {}): Promise<void> {
    this.discord = new DiscordClient({
      ...discordClientOptions,
      intents
    });
    this.discordRest = new REST({ version: '9' }).setToken(discordToken);

    this.initCommandHandlers();
    this.initEventHandlers();

    this.discord.login(discordToken);
  }

  // Initialise and map all command handlers
  // Runs after loadProviders()
  private initCommandHandlers(): void {
    // Load in any subclass interfaces
    this.loadProviders();

    // Add help command, passing in all currently registered providers (help is not yet registered)
    this.providers.push(new HelpCommand(this.name, this.getHelpMessage(), this.providers));
  }

  // Initialise all event handlers
  // Runs before initCustomEventHandlers()
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

    this.initCustomEventHandlers();
  }
  
  // Register all command providers loaded as slash commands
  // Runs after readyhandler()
  private registerCommands(): void {
    // Assign aliases to handler command for each provider 
    this.providers.forEach(provider => {
      provider.provideSlashCommands().forEach(async (command) => {
        try {
          // Based on the flag, either register commands globally
          //  or on each guild currently available
          if (DISCORD_REGISTER_COMMANDS_AS_GLOBAL) {
            await this.registerApplicationCommand(command, null);
          } else {
            await Promise.all(
              this.discord.guilds.cache.map(guild => {
                this.registerApplicationCommand(command, guild.id);
              })
            );
          }

          // Map command name to handler
          if (command.type == ApplicationCommandType.Message || command.type == ApplicationCommandType.User) {
            this.contextCommandHandlers.set(command.name, provider);
          } else {
            this.slashCommandHandlers.set(command.name, provider);
          }
        } catch (e) {
          this.logger.error(`Failed to register command '${command.name}': ${e}`);
        }
      });
    });
  }

  // Subscribe to any extra events outside of the base ones
  public initCustomEventHandlers(): void {
    // Stub function, subclass to override
    return;
  }

  // Add all providers to the providers array
  public loadProviders(): void {
    // Stub function, subclass to override
    return;
  }

  // Return a string for the bot-level help message
  public getHelpMessage(): string {
    throw new Error("Method not implemented");
  }

  // Discord event handlers

  private readyHandler = (): void => {
    this.logger.info("Discord connected");

    // Register commands with API and map handlers
    if (DISCORD_REGISTER_COMMANDS) {
      this.registerCommands();
    }
  }

  private interactionHandler = async (interaction: Interaction): Promise<void> => {
    // Ignore bot interactiosn to avoid messy situations
    if (interaction.user.bot) {
      return;
    }

    if (interaction.isCommand()) {
      // Handle command interactions
      const commandInteraction = interaction as CommandInteraction;

      // If a handler exists for the commandName, handle the command
      const handler = this.slashCommandHandlers.get(commandInteraction.commandName);
      if (handler != null) {
        this.logger.debug(`Command received from '${interaction.user.username}' in '${interaction.guild.name}': ` +
          `!${interaction.commandName}'`);
        handler.handle(commandInteraction);
      }
    } else if (interaction.isContextMenu()) {
      // Handle context menu interactions
      const contextInteraction = interaction as ContextMenuInteraction;

      // If a handler exists for the commandName, handle the command
      const handler = this.contextCommandHandlers.get(contextInteraction.commandName);
      if (handler != null) {
        this.logger.debug(`Command received from '${interaction.user.username}' in '${interaction.guild.name}': ` +
          `!${interaction.commandName}'`);
        handler.handle(contextInteraction);
      } 
    } else if (interaction.isAutocomplete()) {
      // Handle autocomplete interactions
      const commandInteraction = interaction as AutocompleteInteraction;

      // If a handler exists for the commandName and has an autocomplete definition, process
      const handler = this.slashCommandHandlers.get(interaction.commandName);
      if (handler != null && handler.autocomplete != null) {
        this.logger.trace(`Autcomplete request received from '${interaction.user.username}' in '${interaction.guild.name}': ` +
          `!${interaction.commandName}'`);
        handler.autocomplete(commandInteraction);
      }
    }
  }

  private guildCreateHandler = async (guild: Guild): Promise<void> => {
    // If we're registering commands under a guild, register every command on guild join
    if (!DISCORD_REGISTER_COMMANDS_AS_GLOBAL) {
      this.providers.forEach(provider => {
        provider.provideSlashCommands().forEach(async (command) => {
          try {
            this.registerApplicationCommand(command, guild.id);
          } catch (e) {
            this.logger.error(`Failed to register command '${command.name}': ${e}`);
          }
        });
      });
    }
  }

  // Log message handler

  private logHandler = async (log: string): Promise<void> => {
    if (!this.discordLogDisabled && DISCORD_ERROR_CHANNEL != "") {
      try {
        // Remove any consequtive spaces to make logs more legible
        log = log.replace(/  +/, ' ');
        // Should ensure that it works for DM channels too
        const targetChannel = await this.discord.channels.fetch(DISCORD_ERROR_CHANNEL);
        // Only send if we can access the error channel
        if (targetChannel != null && targetChannel.isText()) {
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

  // Register a slash command with the API
  // If guildId is null, command is registered as a global command
  public async registerApplicationCommand(
      command: RESTPostAPIApplicationCommandsJSONBody, guildId: string): 
      Promise<RESTPostAPIApplicationCommandsResult | RESTPostAPIApplicationGuildCommandsResult> {
    // If guildId is set, register it as a guild command
    // Otherwise, register it as a global command
    let response: RESTPostAPIApplicationCommandsResult | RESTPostAPIApplicationGuildCommandsResult = null;

    if (guildId != null) {
      response = await this.discordRest.post(
        Routes.applicationGuildCommands(this.discord.application.id, guildId),
        { body: command }
      ) as RESTPostAPIApplicationGuildCommandsResult;
    } else {
      response = await this.discordRest.post(
        Routes.applicationCommands(this.discord.application.id),
        { body: command }
      ) as RESTPostAPIApplicationCommandsResult;
    }

    this.logger.debug(`Registered command '${command.name}' ${guildId == null ? 'globally' : `to guild '${guildId}'`}`);
    return response;
  }

}