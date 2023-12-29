import {mkdir, readdir, readFile, stat, writeFile} from "fs/promises";
import path from "path";
import util from "util";
import child_process from "child_process";


/**
 * Reads a json file
 * @param {String} filePath
 * @returns {Promise<any>}
 */
export async function readJSON(filePath){
    return JSON.parse(await readFile(filePath, 'utf8'));
}

/**
 * Writes a json file
 * @param {String} filePath
 * @param {Object} data
 * @param {Function} [replacer]
 * @paran {Number} [spacing]
 */
export async function writeJSON(filePath, data, replacer, spacing){
    await writeFile(filePath, JSON.stringify(data, replacer, spacing))
}

/**
 * Executes a file
 * @type {(arg1: string) => Promise<string>}
 */
export const execFile = util.promisify(child_process.execFile);


/**
 * Checks if a file path exists
 * @param {String} filePath
 * @returns {Promise<boolean>}
 */
export async function exists(filePath) {
    try {
        await stat(filePath);
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Gets all files in a directory async
 * @param {String} dirPath
 * @returns {Promise<Array>}
 */
export async function directory(dirPath) {
    const
        result = await readdir(dirPath, {withFileTypes: true}),
        files = await Promise.all(result.map((x) => {
            const res = path.resolve(dirPath, x.name);
            return x.isDirectory() ? directory(res) : res;
        }));
    return files.sort().flat();
}


/**
 * Makes a directory from a file path  recursively
 * @param {String} filepath
 * @return {Promise<string>}
 */
export async function makeFileDirectory(filepath) {
    return mkdir(path.dirname(filepath), {recursive: true});
}


/**
 * Makes a directory recursively
 * @param {String} dir
 * @return {Promise<string>}
 */
export async function makeDirectory(dir) {
    return mkdir(dir, {recursive: true});
}


/**
 * Normalizes a base url
 * @param {String} baseURL
 * @returns {string}
 */
export function removeTrailingSlash(baseURL) {
    return baseURL.endsWith("/") ? baseURL.substring(0, baseURL.length - 1) : baseURL;
}


