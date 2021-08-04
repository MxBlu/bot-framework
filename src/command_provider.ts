import { BotCommand } from "./bot.js";

export type BotCommandHandlerFunction = (command: BotCommand) => Promise<void>;

export interface CommandProvider { 
  // Return a string array of aliases handled
  provideAliases(): string[];
  //Return a function to handle commands
  handle(command: BotCommand): Promise<void>;
}