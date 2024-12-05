import { DEFAULT_MODAL_DURATION } from "./../constants/index.js";
// Big fancy wrapper around ReactionCollectors that works out cleaner
export class Reactable {
    constructor(message) {
        this.message = message;
        this.collector = null;
        this.reactionHandlers = new Map();
    }
    // Activate the Reactable for given duration, 
    async activate(addTemplateReactions, duration = DEFAULT_MODAL_DURATION) {
        // Generate the ReactionCollector to subscribe events
        this.createCollector(duration);
        // If addTemplateReactions is set, add each reactable emoji to the message
        if (addTemplateReactions) {
            for (const emoji of this.reactionHandlers.keys()) {
                try {
                    await this.message.react(emoji);
                }
                catch (e) {
                    if (e instanceof TypeError && e.message.includes("EMOJI_TYPE")) {
                        // If an error regarding EMOJI_TYPE is thrown, throw a more specific Error
                        throw new Error(`Reaction ${emoji} is unknown to Discord`);
                    }
                    else {
                        // Otherwise, re-throw the exception
                        throw e;
                    }
                }
            }
        }
    }
    async deactivate() {
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
    registerHandler(emojiName, handler) {
        // If we already have a collector, it's too late to register a handler
        if (this.collector != null) {
            throw new Error("Reactable already activated");
        }
        this.reactionHandlers.set(emojiName, handler);
    }
    // Assign a handler on the Reactable deactivating
    registerRemovalHandler(handler) {
        this.removalHandler = handler;
    }
    // Create a reaction collector with appropriate filters and event handlers
    createCollector(duration) {
        // Get all the emojis that have handler functions assigned to em
        const handledEmojis = Array.from(this.reactionHandlers.keys());
        // Create a filter for reactions
        // We only want reactions from non-bot users and for reactions we have handlers for
        const filter = (reaction, user) => {
            return !user.bot && handledEmojis.includes(reaction.emoji.name);
        };
        // Generate reaction collector
        this.collector = this.message.createReactionCollector({ filter: filter, time: duration });
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
//# sourceMappingURL=reactable.js.map