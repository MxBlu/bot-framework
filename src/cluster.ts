import { posix } from "path";
import ZooKeeperPromise from "zookeeper";

import { CLUSTER_ENABLED, CLUSTER_RECONNECT_TIMEOUT } from "./constants/constants.js";
import { Dependency } from "./dependency.js";
import { Logger } from "./logger.js";

/**
 * Configuration for the Zookeeper client
 */
export interface ZKConfig {
  /** Connection string. 
   * Multiple servers can be specified with a comma sepating them.
   * 
   * e.g. \<host\>:\<port\>,\<host\>:\<port\>
   */
  connect: string;
  /** Timeout for connection and requests */
  timeout?: number;
  /** Zookeeper debug leve */
  debug_level?: number;
  host_order_deterministic?: boolean;
}

class ClusterImpl {

  /** Logger */
  logger: Logger;

  /** Zookeeper client */
  client: ZooKeeperPromise;

  /** Zookeeper config (needed for reconnection) */
  config: ZKConfig;

  /** Path prefix for all Zookeeper nodes for this application */
  pathPrefix: string;

  /** Timeout handle for the connection timeout */
  connectTimeoutHandle: NodeJS.Timeout;

  /** Path to the node representing this instances' membership */
  membershipNode: string;

  /** 
   * The index of instance in the cluster.
   * 
   * A value of -1 indicates unknown status.
   */
  membershipIndex: number;

  /** 
   * The number of members present in the cluster.
   */
  memberCount: number;

  constructor () {
    this.logger = new Logger("Cluster");
    // If cluster is enabled, init member related values to invalid values
    // Otherwise, init as if this instance is the sole member and always leader
    if (CLUSTER_ENABLED) {
      this.membershipIndex = -1;
      this.memberCount = 0;
    } else {
      this.membershipIndex = 0;
      this.memberCount = 1;
    }
  }

  /**
   * Setup the Zookeeper client and initialise cluster essentials.
   * @param config Zookeeper config
   * @param pathPrefix Prefix for all Zookeeper nodes for this application
   */
  public init(config: ZKConfig, pathPrefix: string): void {
    this.config = config;
    this.pathPrefix = pathPrefix;
    // Initialise client
    this.createClient();
  }

  /**
   * Get the index of instance in the cluster.
   * 
   * A value of -1 indicates unknown status.
   */
  public getMembershipIndex(): number {
    return this.membershipIndex;
  }

  /**
   * Get the number of members in the cluster.
   */
  public get getMemberCount(): number {
    return this.memberCount;
  }
  

  /**
   * Check if this instance is the leader of the cluster.
   * 
   * This is represented by membership index 0.
   * 
   * Always returns true if CLUSTER_ENABLED is set to false.
   * @returns Instance is leader
   */
  public isLeader(): boolean {
    return this.membershipIndex == 0;
  }

  /** 
   * Create the Zookeeper client, with a connection timeout of config.timeout.
   */
  private createClient() {
    // Create client instance
    this.client = new ZooKeeperPromise(this.config);
    
    // Setup connection state handlers
    this.client.on('connect', this.onConnect);
    this.client.on('close', this.onClose);

    // Begin connection and timer for connecting timeout
    this.client.init({});
    this.connectTimeoutHandle = setTimeout(this.onConnectTimeout, 
      this.config.timeout ?? CLUSTER_RECONNECT_TIMEOUT);
  }

  /** Init routines */

  /**
   * Setup initial Zookeeper dirs
   */
  private async initZkDirs(): Promise<void> {
    // Active members
    await this.ensure_path(`${this.pathPrefix}/members`, ZooKeeperPromise.constants.ZOO_PERSISTENT);
  }

  /**
   * Create a cluster membership node and setup watch for membership status
   */
  private async joinMembers(): Promise<void> {
    // Create watcher first
    this.createMembersWatch();
    // Create the membership node
    const path = await this.client.create(`${this.pathPrefix}/members/m_`, '', 
      ZooKeeperPromise.constants.ZOO_EPHEMERAL_SEQUENTIAL);
    // Store the node name for checking membership status
    this.membershipNode = path.split('/').pop();
  }
  
  /** Utilities */

  /**
   * Ensure a path exists, creating any nested paths as needed
   * @param path Zookeeper path
   * @param flags Flags to set on any nodes to be created
   * @returns Final path created
   */
  private async ensure_path(path: string, flags: number): Promise<string> {
    // Split the path up to segments
    const dirs = posix.normalize(path).split(posix.sep).slice(1);

    // Call client.create() for each path segment (with its preceeding path) 
    let res: string = null;
    for (let i = 0; i < dirs.length; i++) {
      // Create the path to check
      let subpath = `/${dirs.slice(0, i + 1).join('/')}`;
      subpath = posix.normalize(subpath);

      // Create paths if they don't exist
      if (! await this.client.pathExists(subpath, false)) {
        res = await this.client.create(subpath, '', flags);
      }
    }

    // Return the last res
    return res;
  }

  /** Connection state event handlers */

  /** Zookeeper connect success handler */
  private onConnect = async (): Promise<void> => {
    this.logger.info('Zookeeper connected');
    this.logger.debug(`Received client id: ${this.client.client_id}`);
    // Stop the timeout timer
    clearTimeout(this.connectTimeoutHandle);

    // Setup folder structure
    await this.initZkDirs();
    // Join the member pool
    await this.joinMembers();

    // Mark dependency as ready
    ClusterDependency.ready();
  };

  /** Zookeeper connect timeout handler */
  private onConnectTimeout = async (): Promise<void> => {
    this.logger.error('Zookeeper connection attempt timed out');
    // Remove the existing client to avoid crashes
    this.client = null;

    // Wait for a timeout, then reconnect
    setTimeout(() => this.createClient(), CLUSTER_RECONNECT_TIMEOUT);
  }

  /** Zookeeper connection close handler */
  private onClose = async (): Promise<void> => {
    this.logger.error('Zookeeper connection closed');
    // Remove the existing client to avoid crashes
    this.client = null;
    
    // Wait for a timeout, then reconnect
    setTimeout(() => this.createClient(), CLUSTER_RECONNECT_TIMEOUT);
  };

  /** Cluster leadership watcher */

  /**
   * Create a watcher for the cluster members
   */
  private createMembersWatch = async () => {
    // Call onMembersChange when the children change, and call 
    // createMembersWatch (this function) to recreate the watch
    this.client.aw_get_children(`${this.pathPrefix}/members`, this.createMembersWatch, this.onMembersChange);
  }

  /** Cluster membership change handler */
  private onMembersChange = async (rc: number, error: number, children: string[]): Promise<void> => {
    const oldMembershipIndex = this.membershipIndex;
    const oldMemberCount = this.memberCount;
    // Update our membership status if we have registered on the cluster
    if (this.membershipNode != null) {
      this.membershipIndex = children.indexOf(this.membershipNode);
      this.memberCount = children.length;
    }

    // Log if cluster status has changed
    if (this.membershipIndex != oldMembershipIndex 
          || this.memberCount != oldMemberCount) {
      this.logger.info(
        `Cluster status updated: membershipIndex=${this.membershipIndex}, memberCount=${this.memberCount}`);
    }
  }

}

/**
 * Zookeeper-based cluster management tools
 */
export const Cluster = new ClusterImpl();
/** Dependency for Cluster */
export const ClusterDependency = new Dependency('Cluster');