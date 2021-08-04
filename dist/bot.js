var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Client as DiscordClient, TextChannel } from "discord.js";
import { sendMessage } from "./bot_utils.js";
import { DISCORD_ERROR_CHANNEL, DISCORD_LOG_ERROR_STATUS_RESET } from "./constants/constants.js";
import { LogLevel } from "./constants/log_levels.js";
import { HelpCommand } from "./default_commands/help_command.js";
import { Logger, NewLogEmitter } from "./logger.js";
var commandSyntax = /^\s*!([A-Za-z]+)((?: +[^ ]+)+)?\s*$/;
var BotCommand = /** @class */ (function () {
    function BotCommand() {
    }
    return BotCommand;
}());
export { BotCommand };
var BaseBot = /** @class */ (function () {
    function BaseBot(name) {
        var _this = this;
        // Discord event handlers
        this.readyHandler = function () {
            _this.logger.info("Discord connected");
            _this.onReady();
        };
        this.messageHandler = function (message) { return __awaiter(_this, void 0, void 0, function () {
            var command;
            return __generator(this, function (_a) {
                // Ignore bot messages to avoid messy situations
                if (message.author.bot) {
                    return [2 /*return*/];
                }
                command = this.parseCommand(message);
                if (command != null) {
                    this.logger.debug("Command received from '" + message.author.username + "' in '" + message.guild.name + "': " +
                        ("!" + command.command + " - '" + command.arguments.join(' ') + "'"));
                    this.commandHandlers.get(command.command)(command);
                }
                return [2 /*return*/];
            });
        }); };
        // Error handler
        this.errorLogHandler = function (log) { return __awaiter(_this, void 0, void 0, function () {
            var targetChannel, e_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.errLogDisabled) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // Remove any consequtive spaces to make logs more legible
                        log = log.replace(/  +/, ' ');
                        return [4 /*yield*/, this.discord.channels.fetch(DISCORD_ERROR_CHANNEL)];
                    case 2:
                        targetChannel = _a.sent();
                        // Only send if we can access the error channel
                        if (targetChannel != null && targetChannel instanceof TextChannel) {
                            sendMessage(targetChannel, log);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        // Trip error flag, prevents error logs hitting here again
                        this.errLogDisabled = true;
                        this.logger.error("Discord error logging exception, disabling error log: " + e_1);
                        // Reset error status after DISCORD_LOG_ERROR_STATUS_RESET ms
                        setTimeout(function () {
                            _this.errLogDisabled = false;
                            _this.logger.debug("Discord error logging re-enabled");
                        }, DISCORD_LOG_ERROR_STATUS_RESET);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        this.name = name;
        this.logger = new Logger(name);
        this.errLogDisabled = false;
        this.providers = [];
        this.commandHandlers = new Map();
    }
    /**
     * Primary function in charge of launching the bot.
     * This should be run after addCommandHandlers() is called.
     * @param discordToken : Discord token received from the bot.
     */
    BaseBot.prototype.init = function (discordToken, discordClientOptions) {
        if (discordClientOptions === void 0) { discordClientOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.discord = new DiscordClient(discordClientOptions);
                this.initCommandHandlers();
                this.initEventHandlers();
                this.discord.login(discordToken);
                return [2 /*return*/];
            });
        });
    };
    BaseBot.prototype.initCommandHandlers = function () {
        var _this = this;
        // Load in any subclass interfaces
        this.loadInterfaces();
        // Add help command
        this.providers.push(new HelpCommand(this.name, this.getHelpMessage()));
        // Assign aliases to handler command for each provider 
        this.providers.forEach(function (provider) {
            provider.provideAliases().forEach(function (alias) {
                _this.commandHandlers.set(alias, provider.handle);
            });
        });
    };
    BaseBot.prototype.initEventHandlers = function () {
        var _this = this;
        this.discord.once('ready', this.readyHandler);
        this.discord.on('message', this.messageHandler);
        this.discord.on('error', function (err) { return _this.logger.error("Discord error: " + err); });
        // Subscribe to ERROR logs being published
        NewLogEmitter.on(LogLevel[LogLevel.ERROR], this.errorLogHandler);
        this.initCustomEventHandlers();
    };
    // Subscribe to any extra events outside of the base ones
    BaseBot.prototype.initCustomEventHandlers = function () {
        // Stub function, subclass to override
        return;
    };
    // Add all interfaces to the interfaces array
    BaseBot.prototype.loadInterfaces = function () {
        // Stub function, subclass to override
        return;
    };
    // Utility functions
    BaseBot.prototype.parseCommand = function (cmdMessage) {
        // Compare against command syntax
        var matchObj = cmdMessage.content.match(commandSyntax);
        // Check if command is valid
        if (matchObj == null || !this.commandHandlers.has(matchObj[1].toLowerCase())) {
            return null;
        }
        // Remove double spaces from arg string, then split it into an array
        // If no args exist (matchObj[2] == null), create empty array
        var cmdArgs = matchObj[2] ? matchObj[2].replace(/  +/g, ' ').trim().split(' ') : [];
        var command = new BotCommand();
        command.message = cmdMessage;
        command.command = matchObj[1].toLowerCase();
        command.arguments = cmdArgs;
        return command;
    };
    BaseBot.prototype.onReady = function () {
        // To override on superclass
        return;
    };
    BaseBot.prototype.getHelpMessage = function () {
        throw new Error("Method not implemented");
    };
    return BaseBot;
}());
export { BaseBot };
//# sourceMappingURL=bot.js.map