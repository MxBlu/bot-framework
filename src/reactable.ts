import { CollectorFilter, GuildMember, Message, MessageReaction, ReactionCollector, User } from "discord.js";

import { DEFAULT_MODAL_DURATION } from "./constants/constants.js";

export type ReactionHandlerFunction<T> = (reactable: Reactable<T>, reaction: MessageReaction, 
  user: GuildMember) => Promise<void>;
export type ReactableRemovalFunction<T> = (reactable: Reactable<T>) => Promise<void>;

// Big fancy wrapper around ReactionCollectors that works out cleaner
export class Reactable<T> {
  // Message that contains the modal
  message: Message;
  // Reaction collector to provide events
  collector: ReactionCollector;
  // Arbitrary stateful data
  props: T;
  // Handler function to call on removal
  removalHandler: ReactableRemovalFunction<T>;
  // Map of all reactions to their handler function
  reactionHandlers: Map<string, ReactionHandlerFunction<T>>;

  constructor(message: Message) {
    this.message = message;
    this.collector = null;
    this.reactionHandlers = new Map();
  }

  // Activate the Reactable for given duration, 
  public async activate(addTemplateReactions: boolean, duration = DEFAULT_MODAL_DURATION): Promise<void> {
    // Generate the ReactionCollector to subscribe events
    this.createCollector(duration);

    // If addTemplateReactions is set, add each reactable emoji to the message
    if (addTemplateReactions) {
      for (const emoji of this.reactionHandlers.keys()) {
        try {
            await this.message.react(emoji);
        } catch (e) {
          if (e instanceof TypeError && e.message.includes("EMOJI_TYPE")) {
            // If an error regarding EMOJI_TYPE is thrown, throw a more specific Error
            throw new Error(`Reaction ${emoji} is unknown to Discord`);
          } else {
            // Otherwise, re-throw the exception
            throw e;
          }
        }
      }
    }
  }

  public async deactivate(): Promise<void> {
    if (!this.collector.ended) {
      this.collector.stop();
      // This will trigger end and recursively call this function, so just return for now
      return;
    }
    // Remove all reactions
    this.message.reactions.removeAll();
    // If we have a function to call on removal, call it
    if (this.removalHandler != null) {
      this.removalHandler(this);
    }
    // Null reference to the collector
    this.collector = null;
  }

  // Assign a handler for a given emoji
  public registerHandler(emojiName: string, handler: ReactionHandlerFunction<T>): void {
    // If we already have a collector, it's too late to register a handler
    if (this.collector != null) {
      throw new Error("Reactable already activated");
    }
    this.reactionHandlers.set(emojiName, handler);
  }

  // Assign a handler on the Reactable deactivating
  public registerRemovalHandler(handler: ReactableRemovalFunction<T>): void {
    this.removalHandler = handler;
  }

  // Create a reaction collector with appropriate filters and event handlers
  private createCollector(duration: number): void {
    // Get all the emojis that have handler functions assigned to em
    const handledEmojis = Array.from(this.reactionHandlers.keys());
    // Create a filter for reactions
    // We only want reactions from non-bot users and for reactions we have handlers for
    const filter: CollectorFilter<[MessageReaction, User]> = (reaction: MessageReaction, user: User) => {
      return !user.bot && handledEmojis.includes(reaction.emoji.name);
    };

    // Generate reaction collector
    this.collector = this.message.createReactionCollector({ filter, time: duration });
    // On "collect" (aka a reaction), call relevant handler function
    this.collector.on("collect", async (reaction, user) => {
      // Convert User to GuildMember - much more useful
      const guildUser = await reaction.message.guild.members.fetch(user.id);
      // Due to above filter, this handler should always exist
      const handler = this.reactionHandlers.get(reaction.emoji.name);

      handler(this, reaction, guildUser);

      // Remove the emoji from the message
      reaction.users.remove(user);
    });
    // On "end", call deactivate
    this.collector.on("end", () => this.deactivate());
  }
}