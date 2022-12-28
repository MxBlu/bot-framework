import { Logger } from "./logger.js";
/**
 * Function type for the callback function called on a new event
 */
export declare type EventCallbackFunction<T> = (data: T, topic: MessengerTopic<T>) => Promise<void>;
/**
 * Utility for passing around messages in a similar fashion to a Node.JS Emitter, but with more typing
 */
export declare class MessengerTopic<T> {
    /** Topic name */
    name: string;
    /** Logger instance */
    logger: Logger;
    /** Subscribed functions */
    subscribers: Map<string, EventCallbackFunction<T>>;
    /** Data from last event */
    lastData: T;
    /**
     * Construct a new MessengerTopic
     * @param name Topic name
     */
    constructor(name: string);
    /**
     * Add function as listener on this topic
     * @param funcName Function name
     * @param func Callback function to be called on event
     */
    subscribe(funcName: string, func: EventCallbackFunction<T>): void;
    /**
     * Remove function from listeners on this topic
     * @param funcName Function name
     */
    unsubscribe(funcName: string): void;
    /**
     * Notify this topic with provided data, and pass to all listening functions
     *
     * Listeners are called asynchronously
     * @param data Notification data
     */
    notify(data: T): void;
}
