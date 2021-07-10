import { Logger } from "./logger.js";
declare type ResolveFunction = (value: void | PromiseLike<void>) => void;
export declare class Dependency {
    static awaitMultiple(...dependencies: Dependency[]): Promise<void>;
    name: string;
    readyPromise: Promise<void>;
    resolve: ResolveFunction;
    logger: Logger;
    constructor(name: string);
    ready(): Promise<void>;
    await(): Promise<void>;
}
export {};
