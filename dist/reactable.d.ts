import { GuildMember, Message, MessageReaction, ReactionCollector } from "discord.js";
export declare type ReactionHandlerFunction<T> = (modal: Reactable<T>, reaction: MessageReaction, user: GuildMember) => Promise<void>;
export declare type ReactableRemovalFunction<T> = (modal: Reactable<T>) => Promise<void>;
export declare class Reactable<T> {
    message: Message;
    collector: ReactionCollector;
    props: T;
    removalHandler: ReactableRemovalFunction<T>;
    reactionHandlers: Map<string, ReactionHandlerFunction<T>>;
    constructor(message: Message);
    activate(addTemplateReactions: boolean, duration?: number): Promise<void>;
    deactivate(): Promise<void>;
    registerHandler(emojiName: string, handler: ReactionHandlerFunction<T>): void;
    registerRemovalHandler(handler: ReactableRemovalFunction<T>): void;
    private createCollector;
}
