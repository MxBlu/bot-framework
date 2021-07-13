import { BotCommandHandlerFunction } from "../bot.js";

export interface CommandInterface { 
  // Returns a map of aliases to command functions to call
  commands(): Map<string, BotCommandHandlerFunction>;
}