import { ButtonInteraction, CollectorFilter, InteractionCollector, Message, MessageActionRow, MessageButton, MessageButtonStyle, MessageComponentInteraction } from "discord.js";

import { DEFAULT_MODAL_DURATION } from "./constants/constants.js";

export type InteractableHandlerFunction<T> = (interactable: Interactable<T>, interaction: ButtonInteraction) => Promise<void>;
export type InteractableRemovalFunction<T> = (interactable: Interactable<T>) => Promise<void>;

export interface InteractableHandlerOption {
  customId?: string;
  label?: string;
  emoji?: string;
  style?: MessageButtonStyle;
}

// Big fancy wrapper around InteractionCollector that works out cleaner
export class Interactable<T> {
  // Message that contains the modal
  message: Message;
  // Interaction collector to provide events
  collector: InteractionCollector<MessageComponentInteraction>;
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

    // Delete all components on the message
    this.message.edit({ components: [] });
    // Null reference to the collector
    this.collector = null;
  }

  // Assign a handler for a given emoji
  public registerHandler(handler: InteractableHandlerFunction<T>, 
      options: InteractableHandlerOption): void {
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
      button.setLabel(options.label)
    } else {
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

      // We only handle BUTTON interactions, other ones are undefined behaviour
      if (interaction.componentType == "BUTTON") {
        // Call handler function
        handler(this, interaction as ButtonInteraction);
      }
    });
    // On "end", call deactivate
    this.collector.on("end", () => this.deactivate());
  }
}