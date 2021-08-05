import { BotCommand } from "./bot.js";

export type BotCommandHandlerFunction = (command: BotCommand) => Promise<void>;

export interface CommandProvider { 
  // Return a string array of aliases handled
  provideAliases(): string[];
  // Return a help message for this command
  provideHelpMessage(): string;
  // Handle command call
  handle(command: BotCommand): Promise<void>;
}