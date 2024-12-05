import { CLUSTER_ENABLED } from "./../constants/index.js";
import { DiscordBot } from "./../discord/index.js";
import { ClusterDependency, ClusterManager } from "./manager.js";
/**
 * Base implementation of a Discord bot using the Discord.js framework
 */
export class ClusteredDiscordBot extends DiscordBot {
    /**
     * Initialise the bot, and start listening and handling events
     *
     * Defaults to only the GUILDS intent, add more intents based on required events
     * @param discordToken Discord API token
     * @param intents Gateway intents, defaulting to GatewayIntentBits.Guilds
     * @param discordClientOptions Discord.js client options, excluding intents
     */
    async init(discordToken, intents, discordClientOptions) {
        // If we're clustered, wait for the cluster connection to be set up
        if (CLUSTER_ENABLED) {
            await ClusterDependency.await();
        }
        await super.init(discordToken, intents, discordClientOptions);
    }
    /**
     * Register all command providers loaded as application commands
     */
    registerCommands() {
        // Only the cluster leader should register commands
        if (CLUSTER_ENABLED && !ClusterManager.isLeader()) {
            return;
        }
        super.registerCommands();
    }
    /**
     * Handle the `interactionCreate` Discord event
     * @param interaction Discord interaction
     */
    async interactionHandler(interaction) {
        // Only the cluster leader should handle commands
        if (CLUSTER_ENABLED && !ClusterManager.isLeader()) {
            return;
        }
        await super.interactionHandler(interaction);
    }
    /**
     * Handle the `guildCreate` Discord event
     * @param guild New Discord Guild
     */
    async guildCreateHandler(guild) {
        // Only the cluster leader should potentially register commands
        if (CLUSTER_ENABLED && !ClusterManager.isLeader()) {
            return;
        }
        await super.guildCreateHandler(guild);
    }
}
//# sourceMappingURL=bot.js.map