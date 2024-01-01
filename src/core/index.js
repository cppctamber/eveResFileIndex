import * as local from "./local.js";
import * as remote from "./remote.js";
import { Clients } from "./internal.js";
import { Cache } from "./utils.js";

export * as hash from "./hash.js";
export * as utils from "./utils.js";
export { local, remote };

/**
 * In-memory cache
 * @type {Cache}
 */
export const cache = new Cache();

/**
 * Local localStorage handler
 * @typedef {Object} LocalStorageHandler
 * @property {Function<Promise>} read
 * @property {Function<Promise>} write
 * @property {Boolean} [force]
 */

/**
 * Gets file indexes for the latest client
 * @param {String} client
 * @param {String} [eveSharedCacheDir]
 * @param {LocalStorageHandler} [localStorage]
 * @returns {Promise<Object>}
 */
export async function getLatestClientFileIndexes(client, eveSharedCacheDir, localStorage){
    return getBuildFileIndexes(await remote.getLatestClientBuild(client), eveSharedCacheDir, localStorage);
}

/**
 * Gets a build file index with in-memory caching
 * @param {Number} build
 * @param {String} [eveSharedCacheDir]
 * @param {LocalStorageHandler} localStorage
 * @returns {Promise<Object>}
 */
async function getBuildFileIndexes(build, eveSharedCacheDir, localStorage){
    if (cache.has(build)) return cache.get(build);
    return cache.set(build, _getBuildFileIndexes(build, eveSharedCacheDir, localStorage), undefined);
}

/**
 * Gets a build file index
 * @param {Number} build
 * @param {String} [eveSharedCacheDir]
 * @param {LocalStorageHandler} [localStorage]
 * @returns {Promise<Object>}
 */
async function _getBuildFileIndexes(build, eveSharedCacheDir, localStorage){
    // From local Storage
    if (localStorage && localStorage.read && !localStorage.force){
        const cached = await localStorage.read(build);
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
    if (localStorage && localStorage.write && result) await localStorage.write(build, result);
    return result;
}