import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, InteractionCollector, Message, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
/** Function type for a handler function on an button interaction event */
export declare type ButtonInteractableHandlerFunction<T> = (interactable: Interactable<T>, interaction: ButtonInteraction) => Promise<void>;
/** Function type for a handler function on a select menu interaction event */
export declare type SelectMenuInteractableHandlerFunction<T> = (interactable: Interactable<T>, interaction: StringSelectMenuInteraction) => Promise<void>;
/** Function type for a handler function on an interaction being removed */
export declare type InteractableRemovalFunction<T> = (interactable: Interactable<T>) => Promise<void>;
/** Type of component to handle */
export declare type InteractableType = "button" | "menu";
/** Function type for a handler function covering both component interaction types */
declare type InteractableHandlerFunction<T> = (interactable: Interactable<T>, interaction: ButtonInteraction | StringSelectMenuInteraction) => Promise<void>;
interface InteractableDefinition<T> {
    handler: InteractableHandlerFunction<T>;
    type: InteractableType;
}
/**
 * Parameters for an interaction handler button
 */
export interface InteractableHandlerButtonOption {
    customId?: string;
    label?: string;
    emoji?: string;
    style?: ButtonStyle;
}
export interface InteractableHandlerSelectMenuOptionItem {
    label: string;
    value: string;
}
export interface InteractableHandlerSelectMenuOption {
    items: InteractableHandlerSelectMenuOptionItem[];
    customId?: string;
    placeholder: string;
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
    collector: InteractionCollector<ButtonInteraction | StringSelectMenuInteraction>;
    /** Message action row builder holding components */
    actionRowBuilder: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>;
    /** Arbitrary stateful data */
    props: T;
    /** Handler function to call on removal */
    removalHandler: InteractableRemovalFunction<T>;
    /** Map of all componentIDs to definitions */
    interactionDefs: Map<string, InteractableDefinition<T>>;
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
     * Assign a handler for a button component
     * @param handler Handler function to be called on interaction
     * @param options Interactable options
     */
    registerButtonHandler(handler: ButtonInteractableHandlerFunction<T>, options: InteractableHandlerButtonOption): void;
    /**
     * Assign a handler for a select menu component
     * @param handler Handler function to be called on interaction
     * @param options Interactable options
     */
    registerSelectMenuHandler(handler: SelectMenuInteractableHandlerFunction<T>, options: InteractableHandlerSelectMenuOption): void;
    /**
     * Assign a handler on the Interactable deactivating
     * @param handler Handler function to be called on interaction deactivation
     */
    registerRemovalHandler(handler: InteractableRemovalFunction<T>): void;
    /**
     * Fetch the currently generated action row.
     * @returns Action row
     */
    getActionRow(): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>;
    /**
   * Create a button builder
   * @param customId custom id used for unique identification of button
   * @param options Options that are used to generate button
   * @returns ButtonBuilder
   */
    private addButtonBuilder;
    /**
     * Create a SelectMenu builder
     *
     * NOTE: SelectMenuBuilder will be deprecated in future versions
     * @param customId custom id used for unique identification of object
     * @param options Options that are used to generate dropdown menu
     * @returns SelectMenuBuilder
     */
    private addSelectMenuBuilder;
    /**
     * Create a interaction collector with appropriate filters and event handlers
     * @param duration Duration to keep the collect interactions for
     */
    private createCollector;
}
export {};
