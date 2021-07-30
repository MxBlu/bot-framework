import { Message, Client as DiscordClient, TextChannel, ClientOptions, BitFieldResolvable, IntentsString } from "discord.js";

import { sendMessage } from "./bot_utils.js";
import { CommandInterface } from "./commands/command_interface.js";
import { DISCORD_ERROR_CHANNEL, DISCORD_LOG_ERROR_STATUS_RESET } from "./constants/constants.js";
import { LogLevel } from "./constants/log_levels.js";
import { Logger, NewLogEmitter } from "./logger.js";

const commandSyntax = /^\s*!([A-Za-z]+)((?: +[^ ]+)+)?\s*$/;

export type BotCommandHandlerFunction = (command: BotCommand) => Promise<void>;

type ClientOptionsWithoutIntents = Omit<ClientOptions, 'intents'>;

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
  errLogDisabled: boolean;

  // Command interfaces that provide handlers
  interfaces: CommandInterface[];

  // Map of command names to handlers
  commandHandlers: Map<string, BotCommandHandlerFunction>;

  constructor(name: string) {
    this.name = name;
    this.logger = new Logger(name);
    this.errLogDisabled = false;
    this.interfaces = [];
    this.commandHandlers = new Map<string, BotCommandHandlerFunction>();
  }

  /**
   * Primary function in charge of launching the bot.
   * This should be run after addCommandHandlers() is called.
   * @param discordToken : Discord token received from the bot.
   */
  public async init(discordToken: string, 
      intents: BitFieldResolvable<IntentsString, number> = [ "GUILDS", "GUILD_MESSAGES" ], 
      discordClientOptions: ClientOptionsWithoutIntents = { }): Promise<void> {
    this.discord  = new DiscordClient({
      ...discordClientOptions,
      intents
    });

    this.initCommandHandlers();
    this.initEventHandlers();

    this.discord.login(discordToken);
  }

  private initCommandHandlers(): void {
    // Add help command
    this.commandHandlers.set("help", this.helpHandler);
    this.commandHandlers.set("h", this.helpHandler);

    // Load in any subclass interfaces
    this.loadInterfaces();

    // Add commands on the interface
    this.interfaces.forEach(iface => {
      iface.commands().forEach((func, alias) => {
        this.commandHandlers.set(alias, func);
      })
    });
  }

  private initEventHandlers(): void {
    this.discord.once('ready', this.readyHandler);
    this.discord.on('message', this.messageHandler);
    this.discord.on('error', err => this.logger.error(`Discord error: ${err}`));

    // Subscribe to ERROR logs being published
    NewLogEmitter.on(LogLevel[LogLevel.ERROR], this.errorLogHandler);

    this.initCustomEventHandlers();
  }

  // Subscribe to any extra events outside of the base ones
  public initCustomEventHandlers(): void {
    // Stub function, subclass to override
    return;
  }

  // Add all interfaces to the interfaces array
  public loadInterfaces(): void {
    // Stub function, subclass to override
    return;
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

  public readyHandler = (): void => {
    this.logger.info("Discord connected");
    this.onReady();
  }

  public onReady(): Promise<void> {
    // To override on superclass
    return;
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
      this.commandHandlers.get(command.command)(command);
    }
  }

  private helpHandler = async (command: BotCommand): Promise<void> => {
    if (command.arguments == null ||
          command.arguments[0].toLowerCase() !== this.name.toLowerCase()) {
      // Only send help for !help <bot name>
      return;
    }

    sendMessage(command.message.channel, this.getHelpMessage());
  }

  // Error handler

  private errorLogHandler = async (log: string): Promise<void> => {
    if (!this.errLogDisabled && DISCORD_ERROR_CHANNEL != 0) {
      try {
        // Remove any consequtive spaces to make logs more legible
        log = log.replace(/  +/, ' ');
        // Should ensure that it works for DM channels too
        const targetChannel = await this.discord.channels.fetch(`${DISCORD_ERROR_CHANNEL}`);
        // Only send if we can access the error channel
        if (targetChannel != null && targetChannel instanceof TextChannel) {
          sendMessage(targetChannel, log);
        }
      } catch (e) {
        // Trip error flag, prevents error logs hitting here again
        this.errLogDisabled = true;
        this.logger.error(`Discord error logging exception, disabling error log: ${e}`);

        // Reset error status after DISCORD_LOG_ERROR_STATUS_RESET ms
        setTimeout(() => { 
          this.errLogDisabled = false;
          this.logger.debug("Discord error logging re-enabled");
        }, DISCORD_LOG_ERROR_STATUS_RESET);
      }
    }
  }

  public getHelpMessage(): string {
    throw new Error("Method not implemented");
  }

}