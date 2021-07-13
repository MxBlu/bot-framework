import { BotCommandHandlerFunction } from "../bot.js";
export interface CommandInterface {
    commands(): Map<string, BotCommandHandlerFunction>;
}
