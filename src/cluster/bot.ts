
import { BitFieldResolvable, GatewayIntentsString, Interaction, Guild } from "discord.js";

import { CLUSTER_ENABLED } from "bot-framework/constants";
import { ClientOptionsWithoutIntents, DiscordBot } from "bot-framework/discord";
import { ClusterDependency, ClusterManager } from "bot-framework/cluster/manager";

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
  public async init(discordToken: string, 
      intents: BitFieldResolvable<GatewayIntentsString, number>, 
      discordClientOptions: ClientOptionsWithoutIntents): Promise<void> {
    // If we're clustered, wait for the cluster connection to be set up
    if (CLUSTER_ENABLED) {
      await ClusterDependency.await();
    }
  
    await super.init(discordToken, intents, discordClientOptions);
  }

  /**
   * Register all command providers loaded as application commands
   */
  protected registerCommands(): void {
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
  protected async interactionHandler(interaction: Interaction): Promise<void> {
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
  protected async guildCreateHandler(guild: Guild): Promise<void> {
    // Only the cluster leader should potentially register commands
    if (CLUSTER_ENABLED && !ClusterManager.isLeader()) {
      return;
    }

    await super.guildCreateHandler(guild);
  }
}