import { ChatInputCommandInteraction } from "discord.js";
import { CommandBuilder, CommandProvider } from "./../command_provider.js";
/** Command to return a help message for the current bot */
export declare class HelpCommand implements CommandProvider<ChatInputCommandInteraction> {
    /** Bot name, used to ensure the command is only run for a given bot */
    botName: string;
    /** Help message to send on call */
    helpMessage: string;
    /**
     * Create a new HelpCommand instance with a list of {@link CommandProvider}
     * @param botName Name of the current bot
     * @param botHelpMessage Top level help message
     * @param providers List of {@link CommandProvider} to generate help messages from
     */
    constructor(botName: string, botHelpMessage: string, providers: CommandProvider<never>[]);
    provideCommands(): CommandBuilder[];
    provideHelpMessage(): string;
    handle(interaction: ChatInputCommandInteraction): Promise<void>;
    /**
     * Generate help message from bot help string and all registered command providers
     * @param botHelpMessage Top level help message
     * @param providers List of {@link CommandProvider} to generate help messages from
     */
    private generateHelpMessage;
}
