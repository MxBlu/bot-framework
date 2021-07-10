import { Client as DiscordClient, GuildMember, Message, MessageReaction } from "discord.js";
import { Logger } from "./logger.js";
export declare class ScrollableModal<T> {
    message: Message;
    props: T;
    removeHandler: (modal: ScrollableModal<T>) => Promise<void>;
    scrollLeftHandler: (modal: ScrollableModal<T>, reaction: MessageReaction, user: GuildMember) => Promise<void>;
    scrollRightHandler: (modal: ScrollableModal<T>, reaction: MessageReaction, user: GuildMember) => Promise<void>;
    activate(): Promise<void>;
    deactivate(): Promise<void>;
    scrollLeft(reaction: MessageReaction, user: GuildMember): Promise<void>;
    scrollRight(reaction: MessageReaction, user: GuildMember): Promise<void>;
}
export declare class ScrollableModalManager {
    discord: DiscordClient;
    activeModals: Map<string, ScrollableModal<unknown>>;
    logger: Logger;
    constructor(discord: DiscordClient);
    addModal(modal: ScrollableModal<unknown>, duration?: number): Promise<void>;
    removeModal(message: Message): Promise<void>;
    messageReactionHandler: (reaction: MessageReaction, user: GuildMember) => Promise<void>;
}
