import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { DEFAULT_MODAL_DURATION } from "./../constants/index.js";
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
        this.interactionDefs = new Map();
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
    async deactivate() {
        // If the collector hasn't been stopped, stop it
        if (!this.collector.ended) {
            this.collector.stop();
            // This will trigger end and recursively call this function, so just return for now
            return;
        }
        // If the collector wasn't ended due to the underlying message being deleted,
        // delete all components on the message
        if (this.collector.endReason != "messageDelete") {
            await this.message.edit({ components: [] });
        }
        // Null reference to the collector
        this.collector = null;
    }
    /**
     * Assign a handler for a button component
     * @param handler Handler function to be called on interaction
     * @param options Interactable options
     */
    registerButtonHandler(handler, options) {
        // If we already have a collector, it's too late to register a handler
        if (this.collector != null) {
            throw new Error("Interactable already activated");
        }
        // Generate a random ID if one isn't specified
        // Random 10 character string
        const customId = options.customId || Math.random().toString(36).substring(2, 12);
        if (options.label == null && options.emoji == null) {
            throw new Error("Interactable handler does not have either a label or an emoji");
        }
        const component = this.addButtonBuilder(customId, options);
        // Add the button to the action row
        this.actionRowBuilder.addComponents(component);
        // Register the handler
        this.interactionDefs.set(customId, {
            handler: handler,
            type: "button"
        });
    }
    /**
     * Assign a handler for a select menu component
     * @param handler Handler function to be called on interaction
     * @param options Interactable options
     */
    registerSelectMenuHandler(handler, options) {
        // If we already have a collector, it's too late to register a handler
        if (this.collector != null) {
            throw new Error("Interactable already activated");
        }
        // Generate a random ID if one isn't specified
        // Random 10 character string
        const customId = options.customId || Math.random().toString(36).substring(2, 12);
        const component = this.addSelectMenuBuilder(customId, options);
        // Add the button to the action row
        this.actionRowBuilder.addComponents(component);
        // Register the handler
        this.interactionDefs.set(customId, {
            handler: handler,
            type: "menu"
        });
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
   * Create a button builder
   * @param customId custom id used for unique identification of button
   * @param options Options that are used to generate button
   * @returns ButtonBuilder
   */
    addButtonBuilder(customId, options) {
        // Generate MessageButton from the button options
        const buttonBuilder = new ButtonBuilder();
        if (options.label != null) {
            buttonBuilder.setLabel(options.label);
        }
        else {
            buttonBuilder.setEmoji(options.emoji);
        }
        buttonBuilder.setStyle(options.style ?? ButtonStyle.Secondary);
        buttonBuilder.setCustomId(customId);
        return buttonBuilder;
    }
    /**
     * Create a SelectMenu builder
     *
     * NOTE: SelectMenuBuilder will be deprecated in future versions
     * @param customId custom id used for unique identification of object
     * @param options Options that are used to generate dropdown menu
     * @returns SelectMenuBuilder
     */
    addSelectMenuBuilder(customId, options) {
        return new StringSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(options.placeholder)
            .addOptions(options.items.map((item) => {
            return new StringSelectMenuOptionBuilder()
                .setLabel(item.label)
                .setValue(item.value);
        }));
    }
    /**
     * Create a interaction collector with appropriate filters and event handlers
     * @param duration Duration to keep the collect interactions for
     */
    createCollector(duration) {
        // Get all the IDs that have handler functions assigned to em
        const handledIds = Array.from(this.interactionDefs.keys());
        // Create a filter for interactions
        // We only want interactions from non-bot users and for interactions we have handlers for
        const filter = (interaction) => {
            return !interaction.user.bot && handledIds.includes(interaction.customId);
        };
        // Generate interaction collector
        this.collector = this.message.createMessageComponentCollector({ filter: filter, time: duration });
        // On "collect" (aka a interaction), call relevant handler function
        this.collector.on("collect", async (interaction) => {
            // Due to above filter, this handler should always exist
            const def = this.interactionDefs.get(interaction.customId);
            // Call handler function
            switch (def.type) {
                case "button": {
                    def.handler(this, interaction);
                    break;
                }
                case "menu": {
                    def.handler(this, interaction);
                    break;
                }
            }
        });
        // On "end", call deactivate
        this.collector.on("end", () => this.deactivate());
    }
}
//# sourceMappingURL=interactable.js.map