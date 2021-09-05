import { Client as DiscordClient, ClientOptions, BitFieldResolvable, IntentsString, Interaction, CommandInteraction, Guild } from "discord.js";
import { REST } from '@discordjs/rest';
import { RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIApplicationCommandsResult, RESTPostAPIApplicationGuildCommandsResult, Routes } from 'discord-api-types/v9';

import { sendMessage } from "./bot_utils.js";
import { CommandProvider } from "./command_provider.js";
import { DISCORD_ERROR_CHANNEL, DISCORD_ERROR_LOGGING_ENABLED, DISCORD_GENERAL_LOGGING_ENABLED, DISCORD_LOG_ERROR_STATUS_RESET, DISCORD_REGISTER_COMMANDS_AS_GLOBAL } from "./constants/constants.js";
import { LogLevel } from "./constants/log_levels.js";
import { HelpCommand } from "./default_commands/help_command.js";
import { Logger, NewLogEmitter } from "./logger.js";

export type ClientOptionsWithoutIntents = Omit<ClientOptions, 'intents'>;

// Temporary types while waiting for discord-api-types to add new types in
export const enum ApplicationCommandType {
  CHAT_INPUT = 1,
  USER = 2,
  MESSAGE = 3
}
export type ModernApplicationCommandJSONBody = RESTPostAPIApplicationCommandsJSONBody & { type?: ApplicationCommandType };

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
  providers: CommandProvider[];
  // Map of command names to handlers
  commandHandlers: Map<string, CommandProvider>;

  constructor(name: string) {
    this.name = name;
    this.logger = new Logger(name);
    this.discordLogDisabled = false;
    this.providers = [];
    this.commandHandlers = new Map<string, CommandProvider>();
  }

  /**
   * Primary function in charge of launching the bot.
   * This should be run after addCommandHandlers() is called.
   * @param discordToken : Discord token received from the bot.
   */
  public async init(discordToken: string, 
      intents: BitFieldResolvable<IntentsString, number> = [ "GUILDS", "GUILD_MESSAGES" ], 
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
    if (!DISCORD_REGISTER_COMMANDS_AS_GLOBAL) {
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
  private registerSlashCommands(): void {
    // Assign aliases to handler command for each provider 
    this.providers.forEach(provider => {
      provider.provideSlashCommands().forEach(async (command) => {
        try {
          // Based on the flag, either register commands globally
          //  or on each guild currently available
          if (DISCORD_REGISTER_COMMANDS_AS_GLOBAL) {
            await this.registerApplicationCommand(command.toJSON(), null);
          } else {
            await Promise.all(
              this.discord.guilds.cache.map(guild => {
                this.registerApplicationCommand(command.toJSON(), guild.id);
              })
            );
          }

          // Map command name to handler
          this.commandHandlers.set(command.name, provider);
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

  // Utility functions

  // Register a slash command with the API
  // If guildId is null, command is registered as a global command
  private async registerApplicationCommand(
      command: ModernApplicationCommandJSONBody, guildId: string): 
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

  // Discord event handlers

  private readyHandler = (): void => {
    this.logger.info("Discord connected");

    // Register commands with API and map handlers
    this.registerSlashCommands();
  }

  private interactionHandler = async (interaction: Interaction): Promise<void> => {
    // Ignore bot interactiosn to avoid messy situations
    if (interaction.user.bot) {
      return;
    }

    // Handle command interactions
    if (interaction.isCommand()) {
      const commandInteraction = interaction as CommandInteraction;

      // If a handler exists for the commandName, handle the command
      const handler = this.commandHandlers.get(commandInteraction.commandName);
      if (handler != null) {
        this.logger.debug(`Command received from '${interaction.user.username}' in '${interaction.guild.name}': ` +
          `!${interaction.commandName}'`);
        handler.handle(interaction);
      }
    }
  }

  private guildCreateHandler = async (guild: Guild): Promise<void> => {
    // If we're registering commands under a guild, register every command on guild join
    if (!DISCORD_REGISTER_COMMANDS_AS_GLOBAL) {
      this.providers.forEach(provider => {
        provider.provideSlashCommands().forEach(async (command) => {
          try {
            this.registerApplicationCommand(command.toJSON(), guild.id);
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

}