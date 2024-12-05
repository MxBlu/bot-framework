import { Logger } from "bot-framework/logger";
/**
 * Function type for `resolve` parameter provided by a Promise
 */
export type ResolveFunction = (value: void | PromiseLike<void>) => void;
/**
 * Utility to help synchronise the order of initiation of various services
 */
export declare class Dependency {
    /**
     * Returns a promise representing multiple {@link Dependency}
     * @param dependencies
     */
    static awaitMultiple(...dependencies: Dependency[]): Promise<void>;
    /** Name of the dependency */
    name: string;
    /** Promise responsible for the waiting of the {@link Dependency} */
    readyPromise: Promise<void>;
    /** Function to resolve the `readyPromise` */
    resolve: ResolveFunction;
    /** Whether this {@link Dependency} has been resolved */
    resolved: boolean;
    /** Logger instance */
    logger: Logger;
    /**
     * Construct a new {@link Dependency}
     * @param name Dependency name
     */
    constructor(name: string);
    /**
     * Mark the {@link Dependency} as ready, notifying any waiting services.
     *
     * If the Dependency is already resolved, this action does nothing.
     */
    ready(): Promise<void>;
    /**
     * Returns a promise waiting on the {@link Dependency} to be ready
     */
    await(): Promise<void>;
}
