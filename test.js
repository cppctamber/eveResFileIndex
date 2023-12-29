import {writeJSON, readJSON, exists} from "./src/utils.js";
import path from "path";
import {fileURLToPath} from "url";
import {getLatestClientFileIndexes} from "./src/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "out");
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

    return getLatestClientFileIndexes(client, eveSharedCache, {
        read: async build => {
            const localCacheFilePath = path.join(outDir, `${build}_fileindex.json`);
            if (await exists(localCacheFilePath)) {
                try {
                    const result = readJSON(localCacheFilePath);
                    console.log(`${build} > Retrieved from cache...`);
                    return result;
                } catch (err) {
                    console.log(`${build} > Failed to retrieve from cache...`);
                }
            }
        },
        write: async (build, data) => {
            const localCacheFilePath = path.join(outDir, `${build}_fileindex.json`);
            if (await exists(localCacheFilePath)) {
                console.log(`${build} > Overwriting cache...`);
            } else {
                console.log(`${build} > Stored in cache...`);
            }
            await writeJSON(localCacheFilePath, data, null, 4);
        },
        force: forceUpdateCache
    })
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