import { Logger } from "./logger.js";

/**
 * Function type for the callback function called on a new event
 */
export type EventCallbackFunction<T> = (data: T, topic: MessengerTopic<T>) => Promise<void>;

/**
 * Utility for passing around messages in a similar fashion to a Node.JS Emitter, but with more typing
 */
export class MessengerTopic<T> {
  /** Topic name */
  name: string
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
  constructor(name: string) {
    this.name = name;
    this.logger = new Logger(`MessengerTopic.${name}`);
    this.subscribers = new Map<string, EventCallbackFunction<T>>();
    this.logger.trace('Topic generated');
  }

  /**
   * Add function as listener on this topic
   * @param funcName Function name
   * @param func Callback function to be called on event
   */
  public subscribe(funcName: string, func: EventCallbackFunction<T>): void {
    if (this.subscribers.has(funcName)) {
      this.logger.error(`Function ${funcName} is already subscribed`);
      return;
    }

    this.subscribers.set(funcName, func);
    this.logger.debug(`Function ${funcName} subscribed`);
  }

  /**
   * Remove function from listeners on this topic
   * @param funcName Function name
   */
  public unsubscribe(funcName: string): void {
    if (!this.subscribers.has(funcName)) {
      this.logger.error(`Function ${funcName} was not subscribed`);
      return;
    }

    this.subscribers.delete(funcName);
    this.logger.debug(`Function ${funcName} unsubscribed`);
  }

  /**
   * Notify this topic with provided data, and pass to all listening functions
   * 
   * Listeners are called asynchronously
   * @param data Notification data
   */
  public notify(data: T): void {
    this.logger.trace('Notifying topic');
    this.lastData = data;
    this.subscribers.forEach( async (f) => {
      f(data, this);
    });
  }
}