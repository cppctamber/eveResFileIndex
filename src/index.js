export * as hash from "./hash.js";
export * as utils from "./utils.js";

import * as local from "./local.js";
import * as remote from "./remote.js";
import { Clients } from "./internal.js";

export { local, remote };

/**
 * Local cache handler
 * @typedef {Object} localCacheHandler
 * @property {AsyncFunction} read
 * @property {AsyncFunction} write
 * @property {Boolean} [force]
 */


/**
 * Gets file indexes for the latest client
 * @param {String} client
 * @param {String} [eveSharedCacheDir]
 * @param {localCacheHandler} [cache]
 * @returns {Promise<Object>}
 */
export async function getLatestClientFileIndexes(client, eveSharedCacheDir, cache){
    return getBuildFileIndexes(await remote.getLatestClientBuild(client), eveSharedCacheDir, cache);
}

/**
 * Gets a build file index
 * @param {Number} build
 * @param {String} [eveSharedCacheDir]
 * @param {localCacheHandler} [cache]
 * @returns {Promise<Object>}
 */
export async function getBuildFileIndexes(build, eveSharedCacheDir, cache){
    // From local cache
    if (cache && cache.read && !cache.force){
        const cached = await cache.read(build);
        if (cached && cached.build === build) return cached;
    }
    let result;
    // From local eve client
    if (eveSharedCacheDir) {
        for (const key in Clients) {
            if (Clients.hasOwnProperty(key)) {
                const localClientBuild = await local.getCurrentClientBuild(Clients[key], eveSharedCacheDir);
                if (localClientBuild === build) {
                    result = await local.getCurrentClientFileIndexes(Clients[key], eveSharedCacheDir);
                    break;
                }
            }
        }
    }
    // From remote server
    if (!result || result.errors) result = await remote.getBuildFileIndexes(build);
    // Cache results
    if (cache && cache.write && result) await cache.write(build, result);
    return result;
}