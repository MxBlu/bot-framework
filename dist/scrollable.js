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
import { DEFAULT_MODAL_DURATION } from "./constants/constants.js";
import { Logger } from "./logger.js";
var ScrollableModal = /** @class */ (function () {
    function ScrollableModal() {
    }
    ScrollableModal.prototype.activate = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Add nav reactions
                this.message.react("⬅️");
                this.message.react("➡️");
                return [2 /*return*/];
            });
        });
    };
    ScrollableModal.prototype.deactivate = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Remove all reactions
                this.message.reactions.removeAll();
                // If we have a function to call on removal, call it
                if (this.removeHandler != null) {
                    this.removeHandler(this);
                }
                return [2 /*return*/];
            });
        });
    };
    ScrollableModal.prototype.scrollLeft = function (reaction, user) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // If we have a function to scroll, call it
                if (this.scrollLeftHandler != null) {
                    this.scrollLeftHandler(this, reaction, user);
                }
                return [2 /*return*/];
            });
        });
    };
    ScrollableModal.prototype.scrollRight = function (reaction, user) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // If we have a function to scroll, call it
                if (this.scrollRightHandler != null) {
                    this.scrollRightHandler(this, reaction, user);
                }
                return [2 /*return*/];
            });
        });
    };
    return ScrollableModal;
}());
export { ScrollableModal };
var ScrollableModalManager = /** @class */ (function () {
    function ScrollableModalManager(discord) {
        var _this = this;
        this.messageReactionHandler = function (reaction, user) { return __awaiter(_this, void 0, void 0, function () {
            var modal, guildUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Only handle reactions for active modals
                        if (!this.activeModals.has(reaction.message.id)) {
                            return [2 /*return*/];
                        }
                        // Ignore reacts by the bot itself
                        if (user.id == this.discord.user.id) {
                            return [2 /*return*/];
                        }
                        modal = this.activeModals.get(reaction.message.id);
                        return [4 /*yield*/, reaction.message.guild.members.fetch(user.id)];
                    case 1:
                        guildUser = _a.sent();
                        // Handle emojis we care about
                        // Remove reaction if we're handling em
                        switch (reaction.emoji.name) {
                            case "⬅️":
                                // Scroll the modal left
                                modal.scrollLeft(reaction, guildUser);
                                reaction.users.remove(guildUser);
                                break;
                            case "➡️":
                                // Scroll the modal right
                                modal.scrollRight(reaction, guildUser);
                                reaction.users.remove(guildUser);
                                break;
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        this.discord = discord;
        this.activeModals = new Map();
        this.logger = new Logger("ScrollableModalManager");
    }
    ScrollableModalManager.prototype.addModal = function (modal, duration) {
        if (duration === void 0) { duration = DEFAULT_MODAL_DURATION; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                // Ensure the message doesn't already have an active modal
                if (this.activeModals.has(modal.message.id)) {
                    this.logger.error("Message ID " + modal.message.id + " already has an active modal");
                    return [2 /*return*/];
                }
                // Add to active modal list
                this.activeModals.set(modal.message.id, modal);
                // Activate modal
                modal.activate();
                // Set lifetime timer
                setTimeout(function (m) { return _this.removeModal(m); }, duration, modal.message);
                this.logger.trace("Modal created for message " + modal.message.id);
                return [2 /*return*/];
            });
        });
    };
    ScrollableModalManager.prototype.removeModal = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var modal;
            return __generator(this, function (_a) {
                // Ensure message has an active modal to remove
                if (!this.activeModals.has(message.id)) {
                    this.logger.error("Message ID " + message.id + " doesn't has an active modal");
                    return [2 /*return*/];
                }
                modal = this.activeModals.get(message.id);
                modal.deactivate();
                // Remove from active modal list
                this.activeModals["delete"](message.id);
                this.logger.trace("Modal removed for message " + message.id);
                return [2 /*return*/];
            });
        });
    };
    return ScrollableModalManager;
}());
export { ScrollableModalManager };
//# sourceMappingURL=scrollable.js.map