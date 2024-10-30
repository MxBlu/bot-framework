import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Logger } from './logger.js';
// Stealth plugin to hopefully avoid triggering CloudFlare
puppeteer.use(StealthPlugin());
/** Implementation of CloudflareBypass */
export class CloudflareBypassImpl {
    /**
     * Create a new CloudflareBypass instance
     *
     * NOTE: Should not be constructed manually
     */
    constructor() {
        this.browser = null; // Instance starts unloaded
        this.logger = new Logger("CloudflareBypass");
    }
    /**
     * Ensure the browser instance is loaded and available for use
     */
    async ensureLoaded() {
        // If a browser instance is not loaded, launch one
        if (this.browser == null) {
            this.browser = await puppeteer.launch({
                channel: 'chrome'
            });
            this.logger.info("Launched a browser instance");
        }
    }
    /**
     * Ensure the browser instance is unloaded (to save memory)
     */
    async ensureUnloaded() {
        if (this.browser != null) {
            await this.browser.close();
            this.browser = null;
            this.logger.info("Unloaded a browser instance");
        }
    }
    /**
     * Fetch a URL using a Puppeteer instance (loading one if necessary)
     * @param url URL to fetch
     * @returns Requested page body
     */
    async fetch(url) {
        // Ensure we have a browser instance loaded for use
        await this.ensureLoaded();
        // Create a page and navigate to the URL, waiting for the content to be loaded
        const page = await this.browser.newPage();
        await page.goto(url, {
            timeout: 45000,
            waitUntil: 'domcontentloaded'
        });
        // Get the page contents
        const content = await page.content();
        // Close the page async, logging an error if we run into one
        page.close().catch(reason => this.logger.error(`Page failed to unload after request to ${url}: ${reason}`));
        return content;
    }
    /**
     * Fetch strings from a page via CSS selector using a Puppeteer instance (loading it if necessary)
     * @param url URL to fetch
     * @param cssSelector CSS selector on the target page to get
     * @returns List of text contents of selected elements
     */
    async fetchElementTextMatches(url, cssSelector) {
        // Ensure we have a browser instance loaded for use
        await this.ensureLoaded();
        // Create a page and navigate to the URL, waiting for the content to be loaded
        const page = await this.browser.newPage();
        await page.goto(url, {
            timeout: 45000,
            waitUntil: 'domcontentloaded'
        });
        // Get the page contents
        const matchTexts = await page.$$eval(cssSelector, els => els.map(el => el.textContent));
        // Close the page async, logging an error if we run into one
        page.close().catch(reason => this.logger.error(`Page failed to unload after request to ${url}: ${reason}`));
        return matchTexts;
    }
}
/**
 * Fetch URIs using a Puppeteer instance to get around CloudFlare
 */
export const CloudflareBypass = new CloudflareBypassImpl();
//# sourceMappingURL=cloudflare_bypass.js.map