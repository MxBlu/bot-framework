# Bot Framework

This is a framework not intended to be executed by itself.

## Implementation/API

Generally, all of the functions are abstracted away to index.js, using module exports.

While it would be wise to write an API, the odds of any other poor soul deciding to work on this was deemed too low. Therefore, we've decided to just say "read the code".

Good luck!

There are example implementations of these frameworks found in weeb_bot and quote_bot, both of which can be found on MxBlu's collection.

## Requirements

Min version of Node supported is v16.9.0 (thanks @discordjs/rest)

To use any imports under /discord, you need:
* discord-api-types@0.37.103
* discord.js@14.16.3

To use cloudflare_bypass, you need:
* puppeteer@19.3.0
* puppeteer-extra@3.3.4
* puppeteer-extra-plugin-stealth@2.11.1

To use any imports under /cluser, you need:
* zookeeper@6.2.3

## Usage

If you wish to use this framework for some psychopathic reason, you can install it utilizing

`npm i https://github.com/MxBlu/bot-framework`.

This will install the package in your node modules, and you don't have to keep this up to date or with a custom `.npmrc`.

## Development
Before developing, run 
`yarn repo-init`. This will move the githooks, so you don't have to remember to constantly run `yarn build` before committing or pushing.

If you're developing for this application, please make sure that the exports are **exporting** from `./dist`.

To generate these `./dist` files (or update these with your code changes), you need to run `yarn build`.