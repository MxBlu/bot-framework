import { sendMessage } from "../bot_utils.js";
var HelpCommand = /** @class */ (function () {
    function HelpCommand(botName, helpMessage) {
        this.botName = botName;
        this.helpMessage = helpMessage;
    }
    // Return a string array of aliases handled
    HelpCommand.prototype.provideAliases = function () {
        return ["h", "help"];
    };
    //Return a function to handle commands
    HelpCommand.prototype.handle = function (command) {
        if (command.arguments == null ||
            command.arguments[0].toLowerCase() !== this.botName.toLowerCase()) {
            // Only send help for !help <bot name>
            return;
        }
        sendMessage(command.message.channel, this.helpMessage);
    };
    return HelpCommand;
}());
export { HelpCommand };
//# sourceMappingURL=help_command.js.map