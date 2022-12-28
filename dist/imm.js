var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Logger } from "./logger.js";
/**
 * Utility for passing around messages in a similar fashion to a Node.JS Emitter, but with more typing
 */
export class MessengerTopic {
    /**
     * Construct a new MessengerTopic
     * @param name Topic name
     */
    constructor(name) {
        this.name = name;
        this.logger = new Logger(`MessengerTopic.${name}`);
        this.subscribers = new Map();
        this.logger.trace('Topic generated');
    }
    /**
     * Add function as listener on this topic
     * @param funcName Function name
     * @param func Callback function to be called on event
     */
    subscribe(funcName, func) {
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
    unsubscribe(funcName) {
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
    notify(data) {
        this.logger.trace('Notifying topic');
        this.lastData = data;
        this.subscribers.forEach((f) => __awaiter(this, void 0, void 0, function* () {
            f(data, this);
        }));
    }
}
//# sourceMappingURL=imm.js.map