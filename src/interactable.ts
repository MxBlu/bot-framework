import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CollectorFilter, InteractionCollector, Message, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, StringSelectMenuInteraction, ComponentType } from "discord.js";

import { DEFAULT_MODAL_DURATION } from "./constants/constants.js";

/** Function type for a handler function on an button interaction event */
export type ButtonInteractableHandlerFunction<T> = (interactable: Interactable<T>, interaction: ButtonInteraction) => Promise<void>;
/** Function type for a handler function on a select menu interaction event */
export type SelectMenuInteractableHandlerFunction<T> = (interactable: Interactable<T>, interaction: StringSelectMenuInteraction) => Promise<void>;
/** Function type for a handler function on an interaction being removed */
export type InteractableRemovalFunction<T> = (interactable: Interactable<T>) => Promise<void>;
/** Type of component to handle */
export type InteractableType = "button" | "menu";

/** Function type for a handler function covering both component interaction types */
type InteractableHandlerFunction<T> = (interactable: Interactable<T>, interaction: ButtonInteraction | StringSelectMenuInteraction) => Promise<void>;

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
  label: string; // what the user will see
  value: string; // this is the developer defined value
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
export class Interactable<T> {
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
   * Assign a handler for a button component 
   * @param handler Handler function to be called on interaction
   * @param options Interactable options
   */
  public registerButtonHandler(handler: ButtonInteractableHandlerFunction<T>,
    options: InteractableHandlerButtonOption): void {
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
  public registerSelectMenuHandler(handler: SelectMenuInteractableHandlerFunction<T>,
    options: InteractableHandlerSelectMenuOption): void {
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
  public registerRemovalHandler(handler: InteractableRemovalFunction<T>): void {
    this.removalHandler = handler;
  }

  /**
   * Fetch the currently generated action row.
   * @returns Action row
   */
  public getActionRow(): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder> {
    return this.actionRowBuilder;
  }

  /**
 * Create a button builder
 * @param customId custom id used for unique identification of button
 * @param options Options that are used to generate button
 * @returns ButtonBuilder
 */
  private addButtonBuilder(customId: string, options: InteractableHandlerButtonOption): ButtonBuilder {
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
  private addSelectMenuBuilder(customId: string, options: InteractableHandlerSelectMenuOption): StringSelectMenuBuilder {
    return new StringSelectMenuBuilder()
      .setCustomId(customId)
      .setPlaceholder(options.placeholder)
      .addOptions(options.items.map((item) => {
        return new StringSelectMenuOptionBuilder()
          .setLabel(item.label)
          .setValue(item.value)
      }));
  }

  /**
   * Create a interaction collector with appropriate filters and event handlers
   * @param duration Duration to keep the collect interactions for
   */
  private createCollector(duration: number): void {
    // Get all the IDs that have handler functions assigned to em
    const handledIds = Array.from(this.interactionDefs.keys());
    // Create a filter for interactions
    // We only want interactions from non-bot users and for interactions we have handlers for
    const filter: CollectorFilter<[ButtonInteraction | StringSelectMenuInteraction]> =
      (interaction: ButtonInteraction | StringSelectMenuInteraction) => {
        return !interaction.user.bot && handledIds.includes(interaction.customId);
      };

    // Generate interaction collector
    this.collector = this.message.createMessageComponentCollector<ComponentType.Button | ComponentType.StringSelect>({ filter: filter, time: duration });
    // On "collect" (aka a interaction), call relevant handler function
    this.collector.on("collect", async (interaction) => {
      // Due to above filter, this handler should always exist
      const def = this.interactionDefs.get(interaction.customId);
      // Call handler function
      switch (def.type) {
        case "button": {
          def.handler(this, <ButtonInteraction>interaction);
          break;
        }
        case "menu": {
          def.handler(this, <StringSelectMenuInteraction>interaction);
          break;
        }
      }
    });
    // On "end", call deactivate
    this.collector.on("end", () => this.deactivate());
  }
}