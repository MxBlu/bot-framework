import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";
import { Interaction } from "discord.js";
export declare const enum ApplicationCommandType {
    CHAT_INPUT = 1,
    USER = 2,
    MESSAGE = 3
}
export declare type ModernApplicationCommandJSONBody = RESTPostAPIApplicationCommandsJSONBody & {
    type?: ApplicationCommandType;
};
export interface CommandProvider<T extends Interaction> {
    provideSlashCommands(): ModernApplicationCommandJSONBody[];
    provideHelpMessage(): string;
    handle(interaction: T): Promise<void>;
}
