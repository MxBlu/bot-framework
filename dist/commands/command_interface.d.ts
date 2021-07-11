import { BotCommandHandlerFunction } from "../bot";
export interface CommandInterface {
    commands(): Map<string, BotCommandHandlerFunction>;
}
