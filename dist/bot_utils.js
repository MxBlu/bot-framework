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
var DISCORD_MAX_LEN = 1900;
// Split up a string into ideally endline terminated strings
// at most length DISCORD_MAX_LEN
export var chunkString = function (str) {
    var chunks = [];
    var strBuffer = '';
    // Split by newline and concat strings until ideal length
    // Then add so chunks list
    str.split("\n").forEach(function (s) {
        // A single oversized string, chunk by length
        if (s.length > DISCORD_MAX_LEN) {
            // Flush buffer as a chunk if there's any
            if (strBuffer.length > 0) {
                chunks.push(strBuffer);
                strBuffer = '';
            }
            for (var i = 0; i < s.length; i += DISCORD_MAX_LEN) {
                chunks.push(s.substr(i, DISCORD_MAX_LEN));
            }
            // Adding the current string would cause it to go oversized
            // Add the current buffer as a chunk, then set the buffer 
            //   to the current str
        }
        else if (strBuffer.length + s.length + 1 > DISCORD_MAX_LEN) {
            chunks.push(strBuffer);
            strBuffer = s + "\n";
            // Otherwise, add the string the the buffer
        }
        else {
            strBuffer += s + "\n";
        }
    });
    // Flush the buffer again
    if (strBuffer.length > 0) {
        chunks.push(strBuffer);
        strBuffer = '';
    }
    return chunks;
};
// Send reply to a user command, logging if appropriate
export var sendCmdMessage = function (message, msg, logger, level) {
    logger.log(message.author.username + " - " + message.guild.name + " - " + msg, level);
    sendMessage(message.channel, msg);
};
// Send message to a given channel, chunking if necessary
export var sendMessage = function (targetChannel, msg) {
    var msgChunks = chunkString(msg);
    msgChunks.forEach(function (chunk) { return targetChannel.send(chunk); });
};
// Compare 2 strings ignoring case 
// Return true if they're equivalent
// Returns true if both strings are null, otherwise 
// return false if either are null
export var stringEquivalence = function (str1, str2) {
    if (str1 === null || str2 == null) {
        return str1 == str2;
    }
    return str1.toLowerCase() === str2.toLowerCase();
};
// Search for str2 in str1 ignoring case
// Returns true if both strings are null, otherwise 
// return false if either are null
export var stringSearch = function (str1, str2) {
    if (str1 === null || str2 == null) {
        return str1 == str2;
    }
    return str1.toLowerCase().includes(str2.toLowerCase());
};
// Test if the author of a given message is admin
export var isAdmin = function (message) {
    return __awaiter(this, void 0, void 0, function () {
        var author;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, message.guild.members.fetch(message.author.id)];
                case 1:
                    author = _a.sent();
                    return [2 /*return*/, author.permissions.has("ADMINISTRATOR")];
            }
        });
    });
};
//# sourceMappingURL=bot_utils.js.map