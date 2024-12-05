import { SlashCommandBuilder } from "discord.js";
/** Command to return a help message for the current bot */
export class HelpCommand {
    /**
     * Create a new HelpCommand instance with a list of {@link CommandProvider}
     * @param botName Name of the current bot
     * @param botHelpMessage Top level help message
     * @param providers List of {@link CommandProvider} to generate help messages from
     */
    constructor(botName, botHelpMessage, providers) {
        this.botName = botName;
        // Generate the help message to use 
        this.generateHelpMessage(botHelpMessage, providers);
    }
    provideCommands() {
        return [
            new SlashCommandBuilder()
                .setName('help')
                .setDescription(`Shows available commands for ${this.botName}`),
        ];
    }
    // Help shouldn't have it's own help message...
    provideHelpMessage() {
        throw new Error("Help does not have a help message");
    }
    async handle(interaction) {
        // Send the stored help message 
        interaction.reply({ content: this.helpMessage });
    }
    /**
     * Generate help message from bot help string and all registered command providers
     * @param botHelpMessage Top level help message
     * @param providers List of {@link CommandProvider} to generate help messages from
     */
    generateHelpMessage(botHelpMessage, providers) {
        // Add bot help message first
        this.helpMessage = botHelpMessage + "\n";
        this.helpMessage += "\n";
        // Then add the help text for each command
        for (const provider of providers) {
            this.helpMessage += provider.provideHelpMessage() + "\n";
        }
    }
}
//# sourceMappingURL=help_command.js.map