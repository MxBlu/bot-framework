import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Interaction } from "discord.js";

import { CommandProvider, ModernApplicationCommandJSONBody } from "../command_provider.js";

// Command to return a help message for the current bot
export class HelpCommand implements CommandProvider<CommandInteraction> {
  // Bot name, used to ensure the command is only run for a given bot
  botName: string;
  // Help message to send on call
  helpMessage: string;

  constructor(botName: string, botHelpMessage: string, providers: CommandProvider<Interaction>[]) {
    this.botName = botName;

    // Generate the help message to use 
    this.generateHelpMessage(botHelpMessage, providers);
  }

  public provideSlashCommands(): ModernApplicationCommandJSONBody[] {
    return [
      new SlashCommandBuilder()
        .setName('help')
        .setDescription(`Shows available commands for ${this.botName}`)
        .toJSON()
    ];
  }

  // Help shouldn't have it's own help message...
  public provideHelpMessage(): string {
    throw new Error("Help does not have a help message");
  }

  public async handle(interaction: CommandInteraction): Promise<void> {    
    return interaction.reply({ content: this.helpMessage });
  }

  // Generate help message from bot help string and all registered command providers
  private generateHelpMessage(botHelpMessage: string, providers: CommandProvider<Interaction>[]) {
    // Add bot help message first
    this.helpMessage = botHelpMessage + "\n";
    this.helpMessage += "\n";
    
    // Then add the help text for each command
    for (const provider of providers) {
      this.helpMessage += provider.provideHelpMessage() + "\n";
    }
  }
}