import { posix } from "path";
import ZooKeeperPromise from "zookeeper";
import { CLUSTER_ENABLED, CLUSTER_RECONNECT_TIMEOUT } from "bot-framework/constants";
import { Dependency } from "bot-framework/dependency";
import { Logger } from "bot-framework/logger";
class ClusterMmanagerImpl {
    constructor() {
        /** Connection state event handlers */
        /** Zookeeper connect success handler */
        this.onConnect = async () => {
            this.logger.info('Zookeeper connected');
            this.logger.debug(`Received client id: ${this.client.client_id}`);
            // Stop the timeout timer if one is present
            if (this.connectTimeoutHandle != null) {
                clearTimeout(this.connectTimeoutHandle);
                this.connectTimeoutHandle = null;
            }
            // Setup folder structure
            await this.initZkDirs();
            // Join the member pool
            await this.joinMembers();
        };
        /**
         * Zookeeper connect timeout handler
         *
         * This just warns that a connection has yet to be successful.
         */
        this.onConnectPending = async () => {
            this.logger.warn('Zookeeper connection taking longer than anticipated');
        };
        /** Zookeeper connection close handler */
        this.onClose = async () => {
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
        this.createMembersWatch = async () => {
            // Call onMembersChange when the children change, and call 
            // createMembersWatch (this function) to recreate the watch
            this.client.aw_get_children(`${this.pathPrefix}/members`, this.createMembersWatch, this.onMembersChange);
        };
        /** Cluster membership change handler */
        this.onMembersChange = async (rc, error, children) => {
            const oldMembershipIndex = this.membershipIndex;
            const oldMemberCount = this.memberCount;
            // Update our membership status if we have registered on the cluster
            if (this.membershipNode != null && children != null && children.length > 0) {
                this.membershipIndex = children.sort().indexOf(this.membershipNode);
                this.memberCount = children.length;
            }
            // Log if cluster status has changed
            if (this.membershipIndex != oldMembershipIndex
                || this.memberCount != oldMemberCount) {
                this.logger.info(`Cluster status updated: membershipIndex=${this.membershipIndex}, memberCount=${this.memberCount}`);
            }
            // Mark Cluster dependency as ready
            // The cluster is only ready after the initial membership update
            ClusterDependency.ready();
        };
        this.logger = new Logger("Cluster");
        // If cluster is enabled, init member related values to invalid values
        // Otherwise, init as if this instance is the sole member and always leader
        if (CLUSTER_ENABLED) {
            this.membershipIndex = -1;
            this.memberCount = 0;
        }
        else {
            this.membershipIndex = 0;
            this.memberCount = 1;
        }
    }
    /**
     * Setup the Zookeeper client and initialise cluster essentials.
     * @param config Zookeeper config
     * @param pathPrefix Prefix for all Zookeeper nodes for this application
     */
    init(config, pathPrefix) {
        // If Cluster is not enabled, just mark the dependency as ready and return
        if (!CLUSTER_ENABLED) {
            ClusterDependency.ready();
            return;
        }
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
    getMembershipIndex() {
        return this.membershipIndex;
    }
    /**
     * Get the number of members in the cluster.
     */
    get getMemberCount() {
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
    isLeader() {
        return this.membershipIndex == 0;
    }
    /**
     * Create the Zookeeper client, with a connection timeout of config.timeout.
     */
    createClient() {
        // Make sure we don't initialise twice
        if (this.client != null) {
            this.logger.warn('Attempted double-initialisation of Zookeeper client');
            return;
        }
        // Create client instance
        this.client = new ZooKeeperPromise(this.config);
        // Setup connection state handlers
        this.client.on('connect', this.onConnect);
        this.client.on('close', this.onClose);
        // Begin connection and timer for connecting timeout
        this.client.init({});
        this.connectTimeoutHandle = setTimeout(this.onConnectPending, this.config.timeout ? this.config.timeout * 2
            : CLUSTER_RECONNECT_TIMEOUT);
    }
    /** Init routines */
    /**
     * Setup initial Zookeeper dirs
     */
    async initZkDirs() {
        // Active members
        await this.ensure_path(`${this.pathPrefix}/members`, ZooKeeperPromise.constants.ZOO_PERSISTENT);
    }
    /**
     * Create a cluster membership node and setup watch for membership status
     */
    async joinMembers() {
        // Create watcher first
        this.createMembersWatch();
        // We already have a membership node, maybe we're reconnecting
        // Make sure the node no longer exists before we make another one
        if (this.membershipNode != null) {
            if (await this.client.pathExists(`${this.pathPrefix}/members/${this.membershipNode}`, false)) {
                this.logger.warn('Reconnecting to cluster, removing old membership node');
                await this.client.delete_(`${this.pathPrefix}/members/${this.membershipNode}`, null);
            }
            else {
                this.logger.warn('Reconnecting to cluster, no old node to clean up');
            }
        }
        // Create the membership node
        const path = await this.client.create(`${this.pathPrefix}/members/m_`, '', ZooKeeperPromise.constants.ZOO_EPHEMERAL_SEQUENTIAL);
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
    async ensure_path(path, flags) {
        // Split the path up to segments
        const dirs = posix.normalize(path).split(posix.sep).slice(1);
        // Call client.create() for each path segment (with its preceeding path) 
        let res = null;
        for (let i = 0; i < dirs.length; i++) {
            // Create the path to check
            let subpath = `/${dirs.slice(0, i + 1).join('/')}`;
            subpath = posix.normalize(subpath);
            // Create paths if they don't exist
            if (!await this.client.pathExists(subpath, false)) {
                res = await this.client.create(subpath, '', flags);
            }
        }
        // Return the last res
        return res;
    }
}
/**
 * Zookeeper-based cluster management tools
 */
export const ClusterManager = new ClusterMmanagerImpl();
/**
 * Dependency for Cluster.
 *
 * Cluster is only ready after the initial membership update.
 */
export const ClusterDependency = new Dependency('ClusterManager');
//# sourceMappingURL=manager.js.map