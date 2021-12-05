import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";
import { Interaction } from "discord.js";
export interface CommandProvider<T extends Interaction> {
    provideSlashCommands(): RESTPostAPIApplicationCommandsJSONBody[];
    provideHelpMessage(): string;
    handle(interaction: T): Promise<void>;
}
