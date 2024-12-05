import { BitFieldResolvable, GatewayIntentsString, Interaction, Guild } from "discord.js";
import { ClientOptionsWithoutIntents, DiscordBot } from "../discord";
/**
 * Base implementation of a Discord bot using the Discord.js framework
 */
export declare class ClusteredDiscordBot extends DiscordBot {
    /**
     * Initialise the bot, and start listening and handling events
     *
     * Defaults to only the GUILDS intent, add more intents based on required events
     * @param discordToken Discord API token
     * @param intents Gateway intents, defaulting to GatewayIntentBits.Guilds
     * @param discordClientOptions Discord.js client options, excluding intents
     */
    init(discordToken: string, intents: BitFieldResolvable<GatewayIntentsString, number>, discordClientOptions: ClientOptionsWithoutIntents): Promise<void>;
    /**
     * Register all command providers loaded as application commands
     */
    protected registerCommands(): void;
    /**
     * Handle the `interactionCreate` Discord event
     * @param interaction Discord interaction
     */
    protected interactionHandler(interaction: Interaction): Promise<void>;
    /**
     * Handle the `guildCreate` Discord event
     * @param guild New Discord Guild
     */
    protected guildCreateHandler(guild: Guild): Promise<void>;
}
