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
export class MessengerTopic {
    constructor(name) {
        this.name = name;
        this.logger = new Logger(`MessengerTopic.${name}`);
        this.subscribers = new Map();
        this.logger.trace('Topic generated');
    }
    // Add function as listener to this topic
    // Must be defined as a standard function, not an arrow function. Otherwise, func.name is null
    // Assumes topic does exist
    subscribe(funcName, func) {
        if (this.subscribers.has(funcName)) {
            this.logger.error(`Function ${funcName} is already subscribed`);
            return;
        }
        this.subscribers.set(funcName, func);
        this.logger.debug(`Function ${funcName} subscribed`);
    }
    // Remove function from listeners
    // Assumes topic does exist
    unsubscribe(funcName) {
        if (!this.subscribers.has(funcName)) {
            this.logger.error(`Function ${funcName} was not subscribed`);
            return;
        }
        this.subscribers.delete(funcName);
        this.logger.debug(`Function ${funcName} unsubscribed`);
    }
    // Call all subscribed functions for a topic with provided data asynchronously
    // Assumes topic does exist
    notify(data) {
        this.logger.trace('Notifying topic');
        this.lastData = data;
        this.subscribers.forEach((f) => __awaiter(this, void 0, void 0, function* () {
            f(data, this);
        }));
    }
    // Get the last data that was added to the topic
    // Assumes topic does exist
    getLastData() {
        return this.lastData;
    }
}
//# sourceMappingURL=imm.js.map