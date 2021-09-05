import { ButtonInteraction, CollectorFilter, InteractionCollector, Message, MessageActionRow, MessageButton, MessageButtonStyle } from "discord.js";

import { DEFAULT_MODAL_DURATION } from "./constants/constants.js";

export type InteractableHandlerFunction<T> = (interactable: Interactable<T>, interaction: ButtonInteraction) => Promise<void>;
export type InteractableRemovalFunction<T> = (interactable: Interactable<T>) => Promise<void>;

// Big fancy wrapper around InteractionCollector that works out cleaner
export class Interactable<T> {
  // Message that contains the modal
  message: Message;
  // Interaction collector to provide events
  collector: InteractionCollector<ButtonInteraction>;
  // Message action row holding buttons
  actionRow: MessageActionRow;
  // Arbitrary stateful data
  props: T;
  // Handler function to call on removal
  removalHandler: InteractableRemovalFunction<T>;
  // Map of all button IDs to their handler function
  interactionHandlers: Map<string, InteractableHandlerFunction<T>>;

  constructor() {
    this.collector = null;
    this.interactionHandlers = new Map();
    this.actionRow = new MessageActionRow();
  }

  // Activate the Interactable for given duration 
  public async activate(message: Message, duration = DEFAULT_MODAL_DURATION): Promise<void> {
    // Set the target message
    this.message = message;
    // Generate the InteractionCollector to subscribe events
    this.createCollector(duration);
  }

  public async deactivate(): Promise<void> {
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
  }

  // Assign a handler for a given emoji
  public registerHandler(label: string, handler: InteractableHandlerFunction<T>, 
      style: MessageButtonStyle = "PRIMARY", customId: string = null): void {
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
    this.actionRow.addComponents(
      new MessageButton()
        .setCustomId(customId)
        .setLabel(label)
        .setStyle(style)
    );
    // Register the handler
    this.interactionHandlers.set(customId, handler);
  }

  // Assign a handler on the Interactable deactivating
  public registerRemovalHandler(handler: InteractableRemovalFunction<T>): void {
    this.removalHandler = handler;
  }

  // Fetch the currently generated action row.
  public getActionRow(): MessageActionRow {
    return this.actionRow;
  }

  // Create a interaction collector with appropriate filters and event handlers
  private createCollector(duration: number): void {
    // Get all the emojis that have handler functions assigned to em
    const handledIds = Array.from(this.interactionHandlers.keys());
    // Create a filter for interactions
    // We only want interactions from non-bot users and for interactions we have handlers for
    const filter: CollectorFilter<[ ButtonInteraction ]> = (interaction: ButtonInteraction) => {
      return !interaction.user.bot && handledIds.includes(interaction.customId);
    };

    // Generate interaction collector
    this.collector = this.message.createMessageComponentCollector({ filter: filter, time: duration });
    // On "collect" (aka a interaction), call relevant handler function
    this.collector.on("collect", async (interaction) => {
      // Due to above filter, this handler should always exist
      const handler = this.interactionHandlers.get(interaction.customId);

      // Call handler function
      handler(this, interaction);
    });
    // On "end", call deactivate
    this.collector.on("end", () => this.deactivate());
  }
}