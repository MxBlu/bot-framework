import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import { CommandBuilder, CommandProvider } from "bot-framework/discord/command_provider";

/** Command to return a help message for the current bot */
export class HelpCommand implements CommandProvider<ChatInputCommandInteraction> {
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
  constructor(botName: string, botHelpMessage: string, providers: CommandProvider<never>[]) {
    this.botName = botName;

    // Generate the help message to use 
    this.generateHelpMessage(botHelpMessage, providers);
  }

  public provideCommands(): CommandBuilder[] {
    return [
      new SlashCommandBuilder()
        .setName('help')
        .setDescription(`Shows available commands for ${this.botName}`),
    ];
  }

  // Help shouldn't have it's own help message...
  public provideHelpMessage(): string {
    throw new Error("Help does not have a help message");
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {   
    // Send the stored help message 
    interaction.reply({ content: this.helpMessage });
  }

  /**
   * Generate help message from bot help string and all registered command providers
   * @param botHelpMessage Top level help message
   * @param providers List of {@link CommandProvider} to generate help messages from
   */
  private generateHelpMessage(botHelpMessage: string, providers: CommandProvider<never>[]) {
    // Add bot help message first
    this.helpMessage = botHelpMessage + "\n";
    this.helpMessage += "\n";
    
    // Then add the help text for each command
    for (const provider of providers) {
      this.helpMessage += provider.provideHelpMessage() + "\n";
    }
  }
}