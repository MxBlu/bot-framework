var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SlashCommandBuilder } from "@discordjs/builders";
// Command to return a help message for the current bot
export class HelpCommand {
    constructor(botName, botHelpMessage, providers) {
        this.botName = botName;
        // Generate the help message to use 
        this.generateHelpMessage(botHelpMessage, providers);
    }
    provideSlashCommands() {
        return [
            new SlashCommandBuilder()
                .setName('help')
                .setDescription(`Shows available commands for ${this.botName}`)
                .toJSON()
        ];
    }
    // Help shouldn't have it's own help message...
    provideHelpMessage() {
        throw new Error("Help does not have a help message");
    }
    handle(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return interaction.reply({ content: this.helpMessage });
        });
    }
    // Generate help message from bot help string and all registered command providers
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