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
import { DEFAULT_MODAL_DURATION } from "./constants/constants.js";
// Big fancy wrapper around ReactionCollectors that works out cleaner
var Reactable = /** @class */ (function () {
    function Reactable(message) {
        this.message = message;
        this.collector = null;
        this.reactionHandlers = new Map();
    }
    // Activate the Reactable for given duration, 
    Reactable.prototype.activate = function (addTemplateReactions, duration) {
        if (duration === void 0) { duration = DEFAULT_MODAL_DURATION; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, emoji, e_1, e_2_1;
            var e_2, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        // Generate the ReactionCollector to subscribe events
                        this.createCollector(duration);
                        if (!addTemplateReactions) return [3 /*break*/, 10];
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 8, 9, 10]);
                        _a = __values(this.reactionHandlers.keys()), _b = _a.next();
                        _d.label = 2;
                    case 2:
                        if (!!_b.done) return [3 /*break*/, 7];
                        emoji = _b.value;
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.message.react(emoji)];
                    case 4:
                        _d.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _d.sent();
                        if (e_1 instanceof TypeError && e_1.message.includes("EMOJI_TYPE")) {
                            // If an error regarding EMOJI_TYPE is thrown, throw a more specific Error
                            throw new Error("Reaction " + emoji + " is unknown to Discord");
                        }
                        else {
                            // Otherwise, re-throw the exception
                            throw e_1;
                        }
                        return [3 /*break*/, 6];
                    case 6:
                        _b = _a.next();
                        return [3 /*break*/, 2];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_2_1 = _d.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 10];
                    case 9:
                        try {
                            if (_b && !_b.done && (_c = _a["return"])) _c.call(_a);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    Reactable.prototype.deactivate = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.collector.ended) {
                    this.collector.stop();
                    // This will trigger end and recursively call this function, so just return for now
                    return [2 /*return*/];
                }
                // Remove all reactions
                this.message.reactions.removeAll();
                // If we have a function to call on removal, call it
                if (this.removalHandler != null) {
                    this.removalHandler(this);
                }
                // Null reference to the collector
                this.collector = null;
                return [2 /*return*/];
            });
        });
    };
    // Assign a handler for a given emoji
    Reactable.prototype.registerHandler = function (emojiName, handler) {
        // If we already have a collector, it's too late to register a handler
        if (this.collector != null) {
            throw new Error("Reactable already activated");
        }
        this.reactionHandlers.set(emojiName, handler);
    };
    // Assign a handler on the Reactable deactivating
    Reactable.prototype.registerRemovalHandler = function (handler) {
        this.removalHandler = handler;
    };
    // Create a reaction collector with appropriate filters and event handlers
    Reactable.prototype.createCollector = function (duration) {
        var _this = this;
        // Get all the emojis that have handler functions assigned to em
        var handledEmojis = Array.from(this.reactionHandlers.keys());
        // Create a filter for reactions
        // We only want reactions from non-bot users and for reactions we have handlers for
        var filter = function (reaction, user) {
            return !user.bot && handledEmojis.includes(reaction.emoji.name);
        };
        // Generate reaction collector
        this.collector = this.message.createReactionCollector(filter, { time: duration });
        // On "collect" (aka a reaction), call relevant handler function
        this.collector.on("collect", function (reaction, user) { return __awaiter(_this, void 0, void 0, function () {
            var guildUser, handler;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, reaction.message.guild.members.fetch(user.id)];
                    case 1:
                        guildUser = _a.sent();
                        handler = this.reactionHandlers.get(reaction.emoji.name);
                        handler(this, reaction, guildUser);
                        // Remove the emoji from the message
                        reaction.users.remove(user);
                        return [2 /*return*/];
                }
            });
        }); });
        // On "end", call deactivate
        this.collector.on("end", function () { return _this.deactivate(); });
    };
    return Reactable;
}());
export { Reactable };
//# sourceMappingURL=reactable.js.map