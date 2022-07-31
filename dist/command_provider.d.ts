import { AutocompleteInteraction, CommandInteraction, ContextMenuCommandBuilder, SlashCommandBuilder } from "discord.js";
/**
 * Common type for builders that build handlable commands.
 *
 * Omissions are to handle the resulting builder object in certain cases.
 */
export declare type CommandBuilder = Omit<SlashCommandBuilder | ContextMenuCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
/**
 * Common interface for classes handling commands
 */
export interface CommandProvider<T extends CommandInteraction> {
    /** Return an array of ApplicationCommand schemas to register */
    provideCommands(): CommandBuilder[];
    /** Return a help message for these commands */
    provideHelpMessage(): string;
    /** Handle command call */
    handle(interaction: T): Promise<void>;
    /** Handle autocomplete request */
    autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
}
