import { BotCommandHandlerFunction } from "../bot";

export interface CommandInterface { 
  // commandName, function
  commands(): Map<string, BotCommandHandlerFunction>;
}