import { Browser } from 'puppeteer';
import { Logger } from './logger.js';
/** Implementation of CloudflareBypass */
declare class CloudflareBypassImpl {
    /** Puppeteer browser instance */
    browser: Browser;
    /** Logger instance */
    logger: Logger;
    /**
     * Create a new CloudflareBypass instance
     *
     * NOTE: Should not be constructed manually
     */
    constructor();
    /**
     * Ensure the browser instance is loaded and available for use
     */
    ensureLoaded(): Promise<void>;
    /**
     * Ensure the browser instance is unloaded (to save memory)
     */
    ensureUnloaded(): Promise<void>;
    /**
     * Fetch a URL using a Puppeteer instance (loading one if necessary)
     * @param url URL to fetch
     * @returns Requested page body
     */
    fetch(url: string): Promise<string>;
    /**
     * Fetch strings from a page via CSS selector using a Puppeteer instance (loading it if necessary)
     * @param url URL to fetch
     * @param cssSelector CSS selector on the target page to get
     * @returns List of text contents of selected elements
     */
    fetchElementTextMatches(url: string, cssSelector: string): Promise<string[]>;
}
/**
 * Fetch URIs using a Puppeteer instance to get around CloudFlare
 */
export declare const CloudflareBypass: CloudflareBypassImpl;
export {};
