import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CollectorFilter, ComponentType, InteractionCollector, Message } from "discord.js";

import { DEFAULT_MODAL_DURATION } from "./constants/constants.js";

/** Function type for a handler function on an interaction event */
export type InteractableHandlerFunction<T> = (interactable: Interactable<T>, interaction: ButtonInteraction) => Promise<void>;
/** Function type for a handler function on an interaction being removed */
export type InteractableRemovalFunction<T> = (interactable: Interactable<T>) => Promise<void>;

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
export class Interactable<T> {
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
  public activate(message: Message, duration = DEFAULT_MODAL_DURATION): void {
    // Set the target message
    this.message = message;
    // Generate the InteractionCollector to subscribe events
    this.createCollector(duration);
  }

  /**
   * Deactivate the interactable handler and remove the components if the message is available
   */
  public async deactivate(): Promise<void> {
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
   * Assign a handler for a given emoji
   * @param handler Handler function to be called on interaction
   * @param options Button options
   */
  public registerHandler(handler: InteractableHandlerFunction<T>, 
      options: InteractableHandlerButtonOption): void {
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
    } else {
      buttonBuilder.setEmoji(options.emoji);
    }
    buttonBuilder.setStyle(options.style ?? ButtonStyle.Secondary);
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
  public registerRemovalHandler(handler: InteractableRemovalFunction<T>): void {
    this.removalHandler = handler;
  }

  /**
   * Fetch the currently generated action row.
   * @returns Action row
   */
  public getActionRow(): ActionRowBuilder<ButtonBuilder> {
    return this.actionRowBuilder;
  }

  /**
   * Create a interaction collector with appropriate filters and event handlers
   * @param duration Duration to keep the collect interactions for
   */
  private createCollector(duration: number): void {
    // Get all the IDs that have handler functions assigned to em
    const handledIds = Array.from(this.interactionHandlers.keys());
    // Create a filter for interactions
    // We only want interactions from non-bot users and for interactions we have handlers for
    const filter: CollectorFilter<[ ButtonInteraction ]> = (interaction: ButtonInteraction) => {
      return !interaction.user.bot && handledIds.includes(interaction.customId);
    };

    // Generate interaction collector
    this.collector = this.message.createMessageComponentCollector<ComponentType.Button>({ filter: filter, time: duration });
    // On "collect" (aka a interaction), call relevant handler function
    this.collector.on("collect", async (interaction) => {
      // Due to above filter, this handler should always exist
      const handler = this.interactionHandlers.get(interaction.customId);
      // Call handler function
      handler(this, interaction as ButtonInteraction);
    });
    // On "end", call deactivate
    this.collector.on("end", () => this.deactivate());
  }
}