import axios from "axios";
import {txtResFileIndexToArray, validateClient} from "./internal.js";
import {removeTrailingSlash} from "./utils.js";


/**
 * Default eve resource base urls
 * @type {{APP: string, RES: string}}
 */
const BaseURL = {
    APP: "https://binaries.eveonline.com",
    RES: "https://resources.eveonline.com"
}


/**
 * Sets the remote app base url
 * @param {String} baseURL
 */
export function setAppBaseURL(baseURL) {
    BaseURL.APP = removeTrailingSlash(baseURL);
}


/**
 * Sets the remote res base url
 * @param {String} baseURL
 */
export function setResBaseURL(baseURL) {
    BaseURL.RES = removeTrailingSlash(baseURL);
}


/**
 * Gets the current client build from ccp's servers
 * @param {String} client
 * @returns {Promise<number>}
 */
export async function getLatestClientBuild(client) {
    client = validateClient(client);
    return axios
        .get(`${BaseURL.APP}/eveclient_${client.toUpperCase()}.json`)
        .then(x => Number(x.data.build));
}

/**
 * Gets the current client's file indexes
 * @param {String} client
 * @returns {Promise<Object>}
 */
export async function getLatestClientFileIndexes(client){
    return getBuildFileIndexes(await getLatestClientBuild(client));
}


/**
 * Gets a remote build's file index
 * - Always return an object even if there are errors
 * @param {Number} build
 * @returns {Promise<Object>}
 */
export async function getBuildFileIndexes(build) {
    const
        appFileIndexURL = `${BaseURL.APP}/eveonline_${build}.txt`,
        result = {
            timestamp: Date.now(),
            build,
            appFileIndex: [],
            resFileIndex: []
        };

    let resFileIndexURL;

    // Get app file index
    try {
        result.appFileIndex = await axios
            .get(appFileIndexURL, {responseType: "text"})
            .then(x => txtResFileIndexToArray(x.data));

        const resFileIndexEntry = result.appFileIndex.find(x => x[0] === "app:/resfileindex.txt");
        resFileIndexURL = resFileIndexEntry ? `${BaseURL.APP}/${resFileIndexEntry[1]}` : null;
    } catch (err) {
        result.errors = [{
            context: "appFileIndex",
            message: err.message,
            stack: err.stack,
            status: err.status,
            code: err.code
        }]
    }

    // Get res file index
    if (resFileIndexURL) {
        try {
            result.resFileIndex = await axios
                .get(resFileIndexURL)
                .then(x => txtResFileIndexToArray(x.data));
        } catch (err) {
            result.errors = [{
                context: "resFileIndex",
                message: err.message,
                stack: err.stack,
                status: err.status,
                code: err.code
            }]
        }
    }

    return result;
}