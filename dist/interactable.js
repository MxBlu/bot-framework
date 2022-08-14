var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { DEFAULT_MODAL_DURATION } from "./constants/constants.js";
/**
 * Helper class to generate and handle events from an interaction.
 *
 * Designed around Discord.js' InteractionCollector, but with a simplified API
 *
 * @param T Prop data type, to persist stateful data between interactions
 */
export class Interactable {
    /**
     * Create a new Interactable
     *
     * @param T Prop data type, to persist stateful data between interactions
     */
    constructor() {
        this.collector = null;
        this.interactionHandlers = new Map();
        this.actionRowBuilder = new ActionRowBuilder();
    }
    /**
     * Activate the Interactable for given duration
     * @param message Discord.js Message to handle events for
     * @param duration Duration to keep the interaction alive for, defaults to DEFAULT_MODAL_DURATION
     */
    activate(message, duration = DEFAULT_MODAL_DURATION) {
        // Set the target message
        this.message = message;
        // Generate the InteractionCollector to subscribe events
        this.createCollector(duration);
    }
    /**
     * Deactivate the interactable handler and remove the components if the message is available
     */
    deactivate() {
        return __awaiter(this, void 0, void 0, function* () {
            // If the collector hasn't been stopped, stop it
            if (!this.collector.ended) {
                this.collector.stop();
                // This will trigger end and recursively call this function, so just return for now
                return;
            }
            // If the collector wasn't ended due to the underlying message being deleted,
            // delete all components on the message
            if (this.collector.endReason != "messageDelete") {
                yield this.message.edit({ components: [] });
            }
            // Null reference to the collector
            this.collector = null;
        });
    }
    /**
     * Assign a handler for a given emoji
     * @param handler Handler function to be called on interaction
     * @param options Button options
     */
    registerHandler(handler, options) {
        var _a;
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
        // Generate MessageButton from the button options
        const buttonBuilder = new ButtonBuilder();
        if (options.label != null) {
            buttonBuilder.setLabel(options.label);
        }
        else {
            buttonBuilder.setEmoji(options.emoji);
        }
        buttonBuilder.setStyle((_a = options.style) !== null && _a !== void 0 ? _a : ButtonStyle.Secondary);
        buttonBuilder.setCustomId(customId);
        // Add the button to the action row
        this.actionRowBuilder.addComponents(buttonBuilder);
        // Register the handler
        this.interactionHandlers.set(customId, handler);
    }
    /**
     * Assign a handler on the Interactable deactivating
     * @param handler Handler function to be called on interaction deactivation
     */
    registerRemovalHandler(handler) {
        this.removalHandler = handler;
    }
    /**
     * Fetch the currently generated action row.
     * @returns Action row
     */
    getActionRow() {
        return this.actionRowBuilder;
    }
    /**
     * Create a interaction collector with appropriate filters and event handlers
     * @param duration Duration to keep the collect interactions for
     */
    createCollector(duration) {
        // Get all the IDs that have handler functions assigned to em
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