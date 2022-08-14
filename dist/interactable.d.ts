import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, InteractionCollector, Message } from "discord.js";
/** Function type for a handler function on an interaction event */
export declare type InteractableHandlerFunction<T> = (interactable: Interactable<T>, interaction: ButtonInteraction) => Promise<void>;
/** Function type for a handler function on an interaction being removed */
export declare type InteractableRemovalFunction<T> = (interactable: Interactable<T>) => Promise<void>;
/**
 * Parameters for an interaction handler button
 */
export interface InteractableHandlerButtonOption {
    customId?: string;
    label?: string;
    emoji?: string;
    style?: ButtonStyle;
}
/**
 * Helper class to generate and handle events from an interaction.
 *
 * Designed around Discord.js' InteractionCollector, but with a simplified API
 *
 * @param T Prop data type, to persist stateful data between interactions
 */
export declare class Interactable<T> {
    /** Message that contains the modal */
    message: Message;
    /** Interaction collector to provide events */
    collector: InteractionCollector<ButtonInteraction>;
    /** Message action row builder holding buttons */
    actionRowBuilder: ActionRowBuilder<ButtonBuilder>;
    /** Arbitrary stateful data */
    props: T;
    /** Handler function to call on removal */
    removalHandler: InteractableRemovalFunction<T>;
    /** Map of all button IDs to their handler function */
    interactionHandlers: Map<string, InteractableHandlerFunction<T>>;
    /**
     * Create a new Interactable
     *
     * @param T Prop data type, to persist stateful data between interactions
     */
    constructor();
    /**
     * Activate the Interactable for given duration
     * @param message Discord.js Message to handle events for
     * @param duration Duration to keep the interaction alive for, defaults to DEFAULT_MODAL_DURATION
     */
    activate(message: Message, duration?: number): void;
    /**
     * Deactivate the interactable handler and remove the components if the message is available
     */
    deactivate(): Promise<void>;
    /**
     * Assign a handler for a given emoji
     * @param handler Handler function to be called on interaction
     * @param options Button options
     */
    registerHandler(handler: InteractableHandlerFunction<T>, options: InteractableHandlerButtonOption): void;
    /**
     * Assign a handler on the Interactable deactivating
     * @param handler Handler function to be called on interaction deactivation
     */
    registerRemovalHandler(handler: InteractableRemovalFunction<T>): void;
    /**
     * Fetch the currently generated action row.
     * @returns Action row
     */
    getActionRow(): ActionRowBuilder<ButtonBuilder>;
    /**
     * Create a interaction collector with appropriate filters and event handlers
     * @param duration Duration to keep the collect interactions for
     */
    private createCollector;
}
