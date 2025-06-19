import { Logger } from "./logger.js";
/**
 * Utility to help synchronise the order of initiation of various services
 */
export class Dependency {
    /**
     * Returns a promise representing multiple {@link Dependency}
     * @param dependencies
     */
    static async awaitMultiple(...dependencies) {
        await Promise.all(dependencies);
    }
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
     * Mark the {@link Dependency} as ready, notifying any waiting services.
     *
     * If the Dependency is already resolved, this action does nothing.
     */
    ready() {
        if (!this.resolved) {
            this.logger.trace(`Ready state triggered`);
            this.resolve();
            this.resolved = true;
        }
    }
    /**
     * @deprecated Await the Dependency directly instead.
     * Returns a promise waiting on the {@link Dependency} to be ready
     */
    async await() {
        return this.readyPromise;
    }
    /**
     * Wait for dependency to be ready
     */
    then(onFulfilled, onRejected) {
        return this.readyPromise.then(onFulfilled, onRejected);
    }
}
//# sourceMappingURL=dependency.js.map