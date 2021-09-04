import { Message, Client as DiscordClient, ClientOptions, BitFieldResolvable, IntentsString } from "discord.js";

import { sendMessage } from "./bot_utils.js";
import { CommandProvider } from "./command_provider.js";
import { DISCORD_ERROR_CHANNEL, DISCORD_ERROR_LOGGING_ENABLED, DISCORD_GENERAL_LOGGING_ENABLED, DISCORD_LOG_ERROR_STATUS_RESET } from "./constants/constants.js";
import { LogLevel } from "./constants/log_levels.js";
import { HelpCommand } from "./default_commands/help_command.js";
import { Logger, NewLogEmitter } from "./logger.js";

const commandSyntax = /^\s*!([A-Za-z]+)((?: +[^ ]+)+)?\s*$/;

export type ClientOptionsWithoutIntents = Omit<ClientOptions, 'intents'>;

export class BotCommand {
  message: Message;

  command: string;

  arguments: string[];
}

export class BaseBot {
  // Bot name
  name: string;
  // Discord client
  discord: DiscordClient;
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
      intents: BitFieldResolvable<IntentsString, number> = [ "GUILD_MESSAGES" ], 
      discordClientOptions: ClientOptionsWithoutIntents = {}): Promise<void> {
    this.discord  = new DiscordClient({
      ...discordClientOptions,
      intents
    });

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

    // Assign aliases to handler command for each provider 
    this.providers.forEach(provider => {
      provider.provideAliases().forEach(alias => {
        // Map alias to handle function, binding this to the provider
        this.commandHandlers.set(alias.toLowerCase(), provider);
      });
    });
  }

  // Initialise all event handlers
  // Runs before initCustomEventHandlers()
  private initEventHandlers(): void {
    this.discord.once('ready', this.readyHandler);
    this.discord.on('messageCreate', this.messageHandler);
    this.discord.on('error', err => this.logger.error(`Discord error: ${err}`));

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

  private parseCommand(cmdMessage: Message): BotCommand {
    // Compare against command syntax
    const matchObj = cmdMessage.content.match(commandSyntax);

    // Check if command is valid
    if (matchObj == null || !this.commandHandlers.has(matchObj[1].toLowerCase())) {
      return null;
    }

    // Remove double spaces from arg string, then split it into an array
    // If no args exist (matchObj[2] == null), create empty array
    const cmdArgs = matchObj[2] ? matchObj[2].replace(/  +/g, ' ').trim().split(' ') : [];

    const command = new BotCommand();
    command.message = cmdMessage;
    command.command = matchObj[1].toLowerCase();
    command.arguments = cmdArgs;

    return command;
  }

  // Discord event handlers

  private readyHandler = (): void => {
    this.logger.info("Discord connected");
  }

  private messageHandler = async (message: Message): Promise<void> => {
    // Ignore bot messages to avoid messy situations
    if (message.author.bot) {
      return;
    }

    const command = this.parseCommand(message);
    if (command != null) {
      this.logger.debug(`Command received from '${message.author.username}' in '${message.guild.name}': ` +
          `!${command.command} - '${command.arguments.join(' ')}'`);
      this.commandHandlers.get(command.command).handle(command);
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