var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MessageActionRow, MessageButton } from "discord.js";
import { DEFAULT_MODAL_DURATION } from "./constants/constants.js";
// Big fancy wrapper around InteractionCollector that works out cleaner
export class Interactable {
    constructor(message) {
        this.message = message;
        this.collector = null;
        this.interactionHandlers = new Map();
        this.actionRow = new MessageActionRow();
    }
    // Activate the Interactable for given duration 
    activate(duration = DEFAULT_MODAL_DURATION) {
        return __awaiter(this, void 0, void 0, function* () {
            // Generate the InteractionCollector to subscribe events
            this.createCollector(duration);
        });
    }
    deactivate() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.collector.ended) {
                this.collector.stop();
                // This will trigger end and recursively call this function, so just return for now
                return;
            }
            // Delete all components
            this.message.components.forEach(row => {
                row.spliceComponents(0, row.components.length);
            });
            // Null reference to the collector
            this.collector = null;
        });
    }
    // Assign a handler for a given emoji
    registerHandler(label, handler, style = "PRIMARY", customId = null) {
        // If we already have a collector, it's too late to register a handler
        if (this.collector != null) {
            throw new Error("Interactable already activated");
        }
        // Generate a random ID if one isn't specified
        if (customId == null) {
            // Generate a random 10 character string
            customId = Math.random().toString(36).substring(2, 12);
        }
        // Add the button to the action row
        this.actionRow.addComponents(new MessageButton()
            .setCustomId(customId)
            .setLabel(label)
            .setStyle(style));
        // Register the handler
        this.interactionHandlers.set(customId, handler);
    }
    // Assign a handler on the Interactable deactivating
    registerRemovalHandler(handler) {
        this.removalHandler = handler;
    }
    // Fetch the currently generated action row.
    getActionRow() {
        return this.actionRow;
    }
    // Create a interaction collector with appropriate filters and event handlers
    createCollector(duration) {
        // Get all the emojis that have handler functions assigned to em
        const handledIds = Array.from(this.interactionHandlers.keys());
        // Create a filter for interactions
        // We only want interactions from non-bot users and for interactions we have handlers for
        const filter = (interaction) => {
            return !interaction.user.bot && handledIds.includes(interaction.customId);
        };
        // Generate interaction collector
        this.collector = this.message.createMessageComponentCollector({ filter: filter, time: duration });
        // On "collect" (aka a interaction), call relevant handler function
        this.collector.on("collect", (interaction) => __awaiter(this, void 0, void 0, function* () {
            // Due to above filter, this handler should always exist
            const handler = this.interactionHandlers.get(interaction.customId);
            // Call handler function
            handler(this, interaction);
        }));
        // On "end", call deactivate
        this.collector.on("end", () => this.deactivate());
    }
}
//# sourceMappingURL=interactable.js.map