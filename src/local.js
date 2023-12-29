import path from "path";
import {readFile} from "fs/promises";
import {exists} from "./utils.js";
import {txtResFileIndexToArray, validateClient} from "./internal.js";


/**
 * Gets a client's current build
 * @param {String} client
 * @param {String} sharedCacheDir
 * @returns {Promise<null|Number>}
 */
export async function getCurrentClientBuild(client, sharedCacheDir) {

    try {
        return getStartIniBuild(path.join(sharedCacheDir, validateClient(client), "start.ini"));
    }
    catch(err)
    {
        return null;
    }
}

/**
 * Gets a local client's file indexes
 * - Always return an object even if there are errors
 * @param {String} client
 * @param {String} sharedCacheDir
 * @returns {Promise<Object>}
 */
export async function getCurrentClientFileIndexes(client, sharedCacheDir) {

    client = validateClient(client);

    const
        clientDir = path.join(sharedCacheDir, client),
        resFileIndexPath = path.join(clientDir, "resfileindex.txt"),
        startIniPath = path.join(clientDir, "start.ini"),
        appFileIndexPath = path.join(sharedCacheDir, `index_${client}.txt`);

    const [appFileIndexExists, resFileIndexExists, startIniExists] = await Promise.all([
        exists(appFileIndexPath),
        exists(resFileIndexPath),
        exists(startIniPath)
    ]);

    const result = {
        timestamp: Date.now(),
        build: null,
        appFileIndex: [],
        resFileIndex: []
    };

    // Get client build
    try {
        if (startIniExists) result.build = await getStartIniBuild(startIniPath);
    } catch (err) {
        result.errors = [{
            context: "start.ini",
            message: err.message,
            stack: err.stack
        }];
        return result;
    }

    // Get app file index
    if (appFileIndexExists) {
        try {
            result.appFileIndex = await readFileIndex(appFileIndexPath);
        } catch (err) {
            result.errors = [{
                context: "appFileIndex",
                message: err.message,
                stack: err.stack,
                status: err.status,
                code: err.code
            }]
        }
    }

    // Get res file index
    if (resFileIndexExists) {
        try {
            result.resFileIndex = await readFileIndex(resFileIndexPath);
        } catch (err) {
            if (!result.errors) result.errors = [];
            result.errors.push({
                context: "resFileIndex",
                message: err.message,
                stack: err.stack,
                status: err.status,
                code: err.code
            })
        }
    }

    return result;
}

/**
 * Reads a file index
 * @param {String} fileIndexPath
 * @returns {Promise<string>}
 */
export async function readFileIndex(fileIndexPath){
    return readFile(fileIndexPath, "utf8").then(txtResFileIndexToArray)
}


/**
 * Reads a start ini
 * @param {String} startIniPath
 * @returns {Promise<{}>}
 */
export async function readStartINI(startIniPath) {
    return readFile(startIniPath, "utf8")
        .then(txt => txt
            .split(/\r?\n/)
            .filter(x => x !== undefined && x.includes(" = "))
            .sort((a, b) => a.localeCompare(b))
            .reduce((acc, cur) => {
                const [property, value] = cur.split(" = ");
                acc[property] = isNaN(value) ? value : Number(value);
                return acc;
            }, {}))
}


/**
 * Gets the build number from a start.ini file
 * @param {String} startIniPath
 * @returns {Promise<null|Number>}
 */
async function getStartIniBuild(startIniPath) {
    try {
        const startIni = await readStartINI(startIniPath);
        if (startIni.build) return startIni.build;
    }
    catch(err)
    {
        //
    }
    throw new Error(`Invalid start.ini: ${startIniPath}`);
}
