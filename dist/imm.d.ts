import { Logger } from "./logger.js";
declare type EventCallbackFunction<T> = (data: T, topic: MessengerTopic<T>) => Promise<void>;
export declare class MessengerTopic<T> {
    name: string;
    logger: Logger;
    subscribers: Map<string, EventCallbackFunction<T>>;
    lastData: T;
    constructor(name: string);
    subscribe(funcName: string, func: EventCallbackFunction<T>): void;
    unsubscribe(funcName: string): void;
    notify(data: T): void;
    getLastData(): T;
}
export {};
