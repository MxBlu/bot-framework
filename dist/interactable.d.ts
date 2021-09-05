import { ButtonInteraction, InteractionCollector, Message, MessageActionRow, MessageButtonStyle } from "discord.js";
export declare type InteractableHandlerFunction<T> = (interactable: Interactable<T>, interaction: ButtonInteraction) => Promise<void>;
export declare type InteractableRemovalFunction<T> = (interactable: Interactable<T>) => Promise<void>;
export interface InteractableHandlerOption {
    customId?: string;
    label?: string;
    emoji?: string;
    style?: MessageButtonStyle;
}
export declare class Interactable<T> {
    message: Message;
    collector: InteractionCollector<ButtonInteraction>;
    actionRow: MessageActionRow;
    props: T;
    removalHandler: InteractableRemovalFunction<T>;
    interactionHandlers: Map<string, InteractableHandlerFunction<T>>;
    constructor();
    activate(message: Message, duration?: number): Promise<void>;
    deactivate(): Promise<void>;
    registerHandler(handler: InteractableHandlerFunction<T>, options: InteractableHandlerOption): void;
    registerRemovalHandler(handler: InteractableRemovalFunction<T>): void;
    getActionRow(): MessageActionRow;
    private createCollector;
}
