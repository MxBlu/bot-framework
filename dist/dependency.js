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
 * Utility to help synchronise the order of initiation of various services
 */
export class Dependency {
    /**
     * Construct a new {@link Dependency}
     * @param name Dependency name
     */
    constructor(name) {
        this.name = name;
        // Create a new Promise and pull out the resolve function into a class variable
        this.readyPromise = new Promise((resolve) => this.resolve = resolve);
        this.resolved = false;
        this.logger = new Logger(`Dependency.${name}`);
    }
    /**
     * Returns a promise representing multiple {@link Dependency}
     * @param dependencies
     */
    static awaitMultiple(...dependencies) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(dependencies.map(d => d.await()));
        });
    }
    /**
     * Mark the ${@link Dependency} as ready, notifying any waiting services
     */
    ready() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.trace(`Ready state triggered`);
            this.resolve();
            this.resolved = true;
        });
    }
    /**
     * Returns a promise waiting on the ${Dependency} to be ready
     */
    await() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.readyPromise;
        });
    }
}
//# sourceMappingURL=dependency.js.map