var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Logger } from './logger.js';
// Stealth plugin to hopefully avoid triggering CloudFlare
puppeteer.use(StealthPlugin());
// Fetch URIs using a Puppeteer instance to get around CloudFlare
class CloudflareBypassImpl {
    constructor() {
        this.browser = null; // Instance starts unloaded
        this.logger = new Logger("CloudflareBypass");
    }
    // Ensure the browser instance is loaded and available for use
    ensureLoaded() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.browser == null) {
                this.browser = yield puppeteer.launch();
            }
        });
    }
    // Ensure the browser instance is unloaded (to save memory)
    ensureUnloaded() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.browser != null) {
                yield this.browser.close();
                this.browser = null;
            }
        });
    }
    // Fetch a URL using a Puppeteer instance (loading it if necessary)
    fetch(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            // Ensure we have a browser instance loaded for use
            yield this.ensureLoaded();
            // Create a page and navigate to the URL, waiting for the content to be loaded
            const page = yield this.browser.newPage();
            yield page.goto(uri, {
                timeout: 45000,
                waitUntil: 'domcontentloaded'
            });
            // Get the page contents
            const content = yield page.content();
            // Close the page async, logging an error if we run into one
            page.close().catch(reason => this.logger.error(`Page failed to unload after request to ${uri}: ${reason}`));
            return content;
        });
    }
    // Fetch strings from a page via CSS selector using a Puppeteer instance (loading it if necessary)
    fetchElementTextMatches(uri, cssSelector) {
        return __awaiter(this, void 0, void 0, function* () {
            // Ensure we have a browser instance loaded for use
            yield this.ensureLoaded();
            // Create a page and navigate to the URL, waiting for the content to be loaded
            const page = yield this.browser.newPage();
            yield page.goto(uri, {
                timeout: 45000,
                waitUntil: 'domcontentloaded'
            });
            // Get the page contents
            const matchTexts = yield page.$$eval(cssSelector, els => els.map(el => el.textContent));
            // Close the page async, logging an error if we run into one
            page.close().catch(reason => this.logger.error(`Page failed to unload after request to ${uri}: ${reason}`));
            return matchTexts;
        });
    }
}
export const CloudflareBypass = new CloudflareBypassImpl();
//# sourceMappingURL=cloudflare_bypass.js.map