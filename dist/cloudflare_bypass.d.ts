import { Browser } from 'puppeteer';
import { Logger } from './logger.js';
declare class CloudflareBypassImpl {
    browser: Browser;
    logger: Logger;
    constructor();
    ensureLoaded(): Promise<void>;
    ensureUnloaded(): Promise<void>;
    fetch(uri: string): Promise<string>;
}
export declare const CloudflareBypass: CloudflareBypassImpl;
export {};
