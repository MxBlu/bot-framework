import { BotCommand } from "../bot.js";
import { sendMessage } from "../bot_utils.js";

export class HelpCommand {
  // Bot name, used to ensure the command is only run for a given bot
  botName: string;
  // Help message to send on call
  helpMessage: string;

  constructor(botName: string, helpMessage: string) {
    this.botName = botName;
    this.helpMessage = helpMessage;
  }

  // Return a string array of aliases handled
  public provideAliases(): string[] {
    return [ "h", "help" ];
  }
  //Return a function to handle commands
  public handle(command: BotCommand): Promise<void> {
    if (command.arguments == null ||
          command.arguments[0].toLowerCase() !== this.botName.toLowerCase()) {
      // Only send help for !help <bot name>
      return;
    }
  
    sendMessage(command.message.channel, this.helpMessage);
  }

}