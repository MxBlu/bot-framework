import ZooKeeperPromise from "zookeeper";
import { Dependency } from "./../dependency.js";
import { Logger } from "./../logger.js";
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
declare class ClusterMmanagerImpl {
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
    constructor();
    /**
     * Setup the Zookeeper client and initialise cluster essentials.
     * @param config Zookeeper config
     * @param pathPrefix Prefix for all Zookeeper nodes for this application
     */
    init(config: ZKConfig, pathPrefix: string): void;
    /**
     * Get the index of instance in the cluster.
     *
     * A value of -1 indicates unknown status.
     */
    getMembershipIndex(): number;
    /**
     * Get the number of members in the cluster.
     */
    get getMemberCount(): number;
    /**
     * Check if this instance is the leader of the cluster.
     *
     * This is represented by membership index 0.
     *
     * Always returns true if CLUSTER_ENABLED is set to false.
     * @returns Instance is leader
     */
    isLeader(): boolean;
    /**
     * Create the Zookeeper client, with a connection timeout of config.timeout.
     */
    private createClient;
    /** Init routines */
    /**
     * Setup initial Zookeeper dirs
     */
    private initZkDirs;
    /**
     * Create a cluster membership node and setup watch for membership status
     */
    private joinMembers;
    /** Utilities */
    /**
     * Ensure a path exists, creating any nested paths as needed
     * @param path Zookeeper path
     * @param flags Flags to set on any nodes to be created
     * @returns Final path created
     */
    private ensure_path;
    /** Connection state event handlers */
    /** Zookeeper connect success handler */
    private onConnect;
    /**
     * Zookeeper connect timeout handler
     *
     * This just warns that a connection has yet to be successful.
     */
    private onConnectPending;
    /** Zookeeper connection close handler */
    private onClose;
    /** Cluster leadership watcher */
    /**
     * Create a watcher for the cluster members
     */
    private createMembersWatch;
    /** Cluster membership change handler */
    private onMembersChange;
}
/**
 * Zookeeper-based cluster management tools
 */
export declare const ClusterManager: ClusterMmanagerImpl;
/**
 * Dependency for Cluster.
 *
 * Cluster is only ready after the initial membership update.
 */
export declare const ClusterDependency: Dependency;
export {};
