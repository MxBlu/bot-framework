import { Logger } from "bot-framework/logger";
/**
 * Utility to help synchronise the order of initiation of various services
 */
export class Dependency {
    /**
     * Returns a promise representing multiple {@link Dependency}
     * @param dependencies
     */
    static async awaitMultiple(...dependencies) {
        await Promise.all(dependencies.map(d => d.await()));
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
    async ready() {
        if (!this.resolved) {
            this.logger.trace(`Ready state triggered`);
            this.resolve();
            this.resolved = true;
        }
    }
    /**
     * Returns a promise waiting on the {@link Dependency} to be ready
     */
    async await() {
        return this.readyPromise;
    }
}
//# sourceMappingURL=dependency.js.map