import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";
import { AutocompleteInteraction, Interaction } from "discord.js";
export interface CommandProvider<T extends Interaction> {
    provideSlashCommands(): RESTPostAPIApplicationCommandsJSONBody[];
    provideHelpMessage(): string;
    handle(interaction: T): Promise<void>;
    autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
}
