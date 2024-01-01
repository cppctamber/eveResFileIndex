import {getLatestClientFileIndexes, utils} from "./src";
import {fileURLToPath} from "url";
import path from "path";

// Get relative directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Set out directory
const outDir = path.join(__dirname, "out");
// Get arguments
const [client, eveSharedCache, forceUpdateCache] = process.argv.slice(2);

/**
 * Retrieves a client's file indexes
 * - Checks local cache first
 * - Then eve client if shared cache folder is provided
 * - Else gets from the eve servers
 * @param {String} client
 * @param {String} [eveSharedCache]
 * @param {String} [forceUpdateCache]
 * @returns {Promise<void>}
 */
async function main(client, eveSharedCache, forceUpdateCache) {

    if (!client) {
        client = "tq";
        console.log(`Client: ${client}`);
    }

    const localStorageOptions = {
        read: async build => {
            const localCacheFilePath = path.join(outDir, `${build}_fileindex.json`);
            if (await utils.exists(localCacheFilePath)) {
                try {
                    const result = await utils.readJSON(localCacheFilePath);
                    console.log(`${build} > Retrieved from local storage...`);
                    return result;
                } catch (err) {
                    console.log(`${build} > Failed to retrieve from local storage...`);
                }
            }
        },
        write: async (build, data) => {
            const localCacheFilePath = path.join(outDir, `${build}_fileindex.json`);
            if (await utils.exists(localCacheFilePath)) {
                console.log(`${build} > Overwriting local storage...`);
            } else {
                console.log(`${build} > Stored in local storage...`);
            }
            return utils.writeJSON(localCacheFilePath, data, null, 4);
        },
        force: forceUpdateCache
    }

    // Test storing locally
    await getLatestClientFileIndexes(client, eveSharedCache, localStorageOptions);
    // Test getting from in memory cache
    return getLatestClientFileIndexes(client, eveSharedCache, localStorageOptions);

}

main(client, eveSharedCache, forceUpdateCache)
    .then(x=> console.debug({
        build: x.build,
        timestamp: x.timestamp,
        errors: !!x.errors,
        appFiles: x.appFileIndex.length,
        resFiles: x.resFileIndex.length
    }))
    .catch(console.error);