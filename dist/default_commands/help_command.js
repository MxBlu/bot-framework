var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import { sendMessage } from "../bot_utils.js";
// Command to return a help message for the current bot
var HelpCommand = /** @class */ (function () {
    function HelpCommand(botName, botHelpMessage, providers) {
        this.botName = botName;
        // Generate the help message to use 
        this.generateHelpMessage(botHelpMessage, providers);
    }
    HelpCommand.prototype.provideAliases = function () {
        return ["h", "help"];
    };
    // Help shouldn't have it's own help message...
    HelpCommand.prototype.provideHelpMessage = function () {
        throw new Error("Help does not have a help message");
    };
    HelpCommand.prototype.handle = function (command) {
        if (command.arguments == null ||
            command.arguments[0].toLowerCase() !== this.botName.toLowerCase()) {
            // Only send help for !help <bot name>
            return;
        }
        sendMessage(command.message.channel, this.helpMessage);
    };
    // Generate help message from bot help string and all registered command providers
    HelpCommand.prototype.generateHelpMessage = function (botHelpMessage, providers) {
        var e_1, _a;
        // Add bot help message first
        this.helpMessage = botHelpMessage + "\n";
        this.helpMessage += "\n";
        try {
            // Then add the help text for each command
            for (var providers_1 = __values(providers), providers_1_1 = providers_1.next(); !providers_1_1.done; providers_1_1 = providers_1.next()) {
                var provider = providers_1_1.value;
                this.helpMessage += provider.provideHelpMessage() + "\n";
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (providers_1_1 && !providers_1_1.done && (_a = providers_1["return"])) _a.call(providers_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    return HelpCommand;
}());
export { HelpCommand };
//# sourceMappingURL=help_command.js.map