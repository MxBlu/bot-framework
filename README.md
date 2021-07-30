# Bot Framework

This is a framework not intended to be executed by itself.

## Implementation/API

Generally, all of the functions are abstracted away to index.js, using module exports.

While it would be wise to write an API, the odds of any other poor soul deciding to work on this was deemed too low. Therefore, we've decided to just say "read the code".

Good luck!

There are example implementations of these frameworks found in weeb_bot and quote_bot, both of which can be found on MxBlu's collection.

## Requirements

Requires Node v14 minimum (due to requirement of discord.js master)

## Usage

If you wish to use this framework for some psychopathic reason, you can install it utilizing

`npm i https://github.com/MxBlu/bot-framework`.

This will install the package in your node modules, and you don't have to keep this up to date or with a custom `.npmrc`.

## Development
Before developing, run 
`yarn repo-init`. This will move the githooks, so you don't have to remember to constantly run `yarn build` before committing or pushing.

If you're developing for this application, please make sure that the exports are **exporting** from `./dist`.

To generate these `./dist` files (or update these with your code changes), you need to run `yarn build`.