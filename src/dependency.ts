import { Logger } from "./logger.js";

/**
 * Function type for `resolve` parameter provided by a {@link Promise}
 */
type ResolveFunction = (value: void | PromiseLike<void>) => void;

/**
 * Utility to help synchronise the order of initiation of various services
 */
export class Dependency {

  /**
   * Returns a promise representing multiple {@link Dependency}
   * @param dependencies 
   */
  public static async awaitMultiple(...dependencies: Dependency[]): Promise<void> {
    await Promise.all(dependencies.map(d => d.await()));
  }

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
  constructor(name: string) {
    this.name = name;
    // Create a new Promise and pull out the resolve function into a class variable
    this.readyPromise = new Promise<void>((resolve) => this.resolve = resolve);
    this.resolved = false;
    this.logger = new Logger(`Dependency.${name}`);
  }

  /**
   * Mark the ${@link Dependency} as ready, notifying any waiting services
   */
  public async ready(): Promise<void> {
    this.logger.trace(`Ready state triggered`);
    this.resolve();
    this.resolved = true;
  }

  /**
   * Returns a promise waiting on the ${Dependency} to be ready
   */
  public async await(): Promise<void> {
    return this.readyPromise;
  }
}