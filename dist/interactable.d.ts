import { ButtonInteraction, InteractionCollector, Message, MessageActionRow, MessageButtonStyle } from "discord.js";
export declare type InteractableHandlerFunction<T> = (interactable: Interactable<T>, interaction: ButtonInteraction) => Promise<void>;
export declare type InteractableRemovalFunction<T> = (interactable: Interactable<T>) => Promise<void>;
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
    registerHandler(label: string, handler: InteractableHandlerFunction<T>, style?: MessageButtonStyle, customId?: string): void;
    registerRemovalHandler(handler: InteractableRemovalFunction<T>): void;
    getActionRow(): MessageActionRow;
    private createCollector;
}
