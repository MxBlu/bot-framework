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
    constructor() {
        this.collector = null;
        this.interactionHandlers = new Map();
        this.actionRow = new MessageActionRow();
    }
    // Activate the Interactable for given duration 
    activate(message, duration = DEFAULT_MODAL_DURATION) {
        return __awaiter(this, void 0, void 0, function* () {
            // Set the target message
            this.message = message;
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
            // Delete all components on the message
            this.message.edit({ components: [] });
            // Null reference to the collector
            this.collector = null;
        });
    }
    // Assign a handler for a given emoji
    registerHandler(handler, options) {
        // If we already have a collector, it's too late to register a handler
        if (this.collector != null) {
            throw new Error("Interactable already activated");
        }
        // Ensure either a label or an emoji is defined
        if (options.label == null && options.emoji == null) {
            throw new Error("Interactable handler does not have either a label or an emoji");
        }
        // Generate a random ID if one isn't specified
        // Random 10 character string
        const customId = options.customId || Math.random().toString(36).substring(2, 12);
        // Generate MessageButton
        const button = new MessageButton();
        if (options.label != null) {
            button.setLabel(options.label);
        }
        else {
            button.setEmoji(options.emoji);
        }
        button.setStyle(options.style || "SECONDARY");
        button.setCustomId(customId);
        // Add the button to the action row
        this.actionRow.addComponents(button);
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
            // We only handle BUTTON interactions, other ones are undefined behaviour
            if (interaction.componentType == "BUTTON") {
                // Call handler function
                handler(this, interaction);
            }
        }));
        // On "end", call deactivate
        this.collector.on("end", () => this.deactivate());
    }
}
//# sourceMappingURL=interactable.js.map