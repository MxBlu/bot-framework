import { Browser, executablePath } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import { Logger } from 'bot-framework/logger';

// Stealth plugin to hopefully avoid triggering CloudFlare
puppeteer.use(StealthPlugin());

/** Implementation of CloudflareBypass */
export class CloudflareBypassImpl {
  /** Puppeteer browser instance */
  browser: Browser;
  /** Logger instance */
  logger: Logger;
  /** Prevents browser being launched twice */
  lock: Promise<void>;

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
  public async ensureLoaded(): Promise<void> {
    // Wait on the lock if there is one
    if (this.lock != null) {
      await this.lock;
    }
    // If a browser instance is not loaded, launch one
    if (this.browser == null) {
      //  Lock this section
      let resolveFn: (value: void | PromiseLike<void>) => void;
      this.lock = new Promise<void>((res) => resolveFn = res);

      this.browser = await puppeteer.launch({
        executablePath: executablePath()
      });
      this.logger.info("Launched a browser instance");
      
      // Clear the lock
      resolveFn();
      this.lock = null;
    }
  }

  /**
   * Ensure the browser instance is unloaded (to save memory)
   */
  public async ensureUnloaded(): Promise<void> {
    // Wait on the lock if there is one
    if (this.lock != null) {
      await this.lock;
    }
    // If a browser instance is loaded, clear close it
    if (this.browser != null) {
      //  Lock this section
      let resolveFn: (value: void | PromiseLike<void>) => void;
      this.lock = new Promise<void>((res) => resolveFn = res);

      await this.browser.close();
      this.browser = null;
      this.logger.info("Unloaded a browser instance");
      
      // Clear the lock
      resolveFn();
      this.lock = null;
    }
  }

  /**
   * Fetch a URL using a Puppeteer instance (loading one if necessary)
   * @param url URL to fetch
   * @returns Requested page body
   */
  public async fetch(url: string): Promise<string> {
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
    page.close().catch(reason => 
        this.logger.error(`Page failed to unload after request to ${url}: ${reason}`));

    return content;
  }

  /**
   * Fetch strings from a page via CSS selector using a Puppeteer instance (loading it if necessary)
   * @param url URL to fetch
   * @param cssSelector CSS selector on the target page to get
   * @returns List of text contents of selected elements
   */
  public async fetchElementTextMatches(url: string, cssSelector: string): Promise<string[]> {
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
    page.close().catch(reason => 
        this.logger.error(`Page failed to unload after request to ${url}: ${reason}`));

    return matchTexts;
  }
}

/**
 * Fetch URIs using a Puppeteer instance to get around CloudFlare
 */
export const CloudflareBypass = new CloudflareBypassImpl();