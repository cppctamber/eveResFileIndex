import crypto from "crypto";
import {createReadStream} from "fs";
import {stat} from "fs/promises";


/**
 * Validates a res file's hash
 * @param {String} filePath
 * @param {String} prefixedResPath
 * @param {String} resHash
 * @param {Number} [resSize]
 * @returns {Promise<Boolean>}
 */
export async function validate(filePath, prefixedResPath, resHash, resSize) {
    if (resSize != null) {
        const {size} = await stat(filePath);
        if (size !== resSize) return false;
    }
    const calculatedHash = await resFile(filePath, prefixedResPath)
    return resHash === calculatedHash;
}


/**
 * Creates a hash for a resFile
 * @param {String} filePath
 * @param {String} prefixedResPath
 * @returns {Promise<string>}
 */
export async function resFile(filePath, prefixedResPath) {
    const _fnv164 = fnv164(prefixedResPath);
    return `${_fnv164.substring(0, 2)}/${_fnv164}_${await md5(filePath)}`;
}


/**
 * Creates a md5 hash from a file
 * @param {String} filePath
 * @returns {Promise<String>}
 */
export async function md5(filePath) {
    return new Promise((resolve, reject) => {
        const
            hash = crypto.createHash("md5"),
            stream = createReadStream(filePath);

        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', (error) => reject(error));
    });
}


let hl;

/**
 * Creates a fnv164 hash from a string
 * @author Travis Webb <me@traviswebb.com> tjwebb/fnv-plus
 * @param {String} str
 * @returns {String}
 */
export function fnv164(str) {
    if (!hl) {
        hl = [];
        for (let i = 0; i < 256; i++) hl[i] = ((i >> 4) & 15).toString(16) + (i & 15).toString(16);
    }

    let i,
        l = str.length - 3,
        s = [52210, 40164, 33826, 8997], // Offsets
        t0 = 0,
        t1 = 0,
        t2 = 0,
        t3 = 0,
        v0 = s[3] | 0,
        v1 = s[2] | 0,
        v2 = s[1] | 0,
        v3 = s[0] | 0;

    for (i = 0; i < l;) {
        t0 = v0 * 435;
        t1 = v1 * 435;
        t2 = v2 * 435;
        t3 = v3 * 435;
        t2 += v0 << 8;
        t3 += v1 << 8;
        t1 += t0 >>> 16;
        v0 = t0 & 65535;
        t2 += t1 >>> 16;
        v1 = t1 & 65535;
        v3 = (t3 + (t2 >>> 16)) & 65535;
        v2 = t2 & 65535;
        v0 ^= str.charCodeAt(i++);

        t0 = v0 * 435;
        t1 = v1 * 435;
        t2 = v2 * 435;
        t3 = v3 * 435;
        t2 += v0 << 8;
        t3 += v1 << 8;
        t1 += t0 >>> 16;
        v0 = t0 & 65535;
        t2 += t1 >>> 16;
        v1 = t1 & 65535;
        v3 = (t3 + (t2 >>> 16)) & 65535;
        v2 = t2 & 65535;
        v0 ^= str.charCodeAt(i++);

        t0 = v0 * 435;
        t1 = v1 * 435;
        t2 = v2 * 435;
        t3 = v3 * 435;
        t2 += v0 << 8;
        t3 += v1 << 8;
        t1 += t0 >>> 16;
        v0 = t0 & 65535;
        t2 += t1 >>> 16;
        v1 = t1 & 65535;
        v3 = (t3 + (t2 >>> 16)) & 65535;
        v2 = t2 & 65535;
        v0 ^= str.charCodeAt(i++);

        t0 = v0 * 435;
        t1 = v1 * 435;
        t2 = v2 * 435;
        t3 = v3 * 435;
        t2 += v0 << 8;
        t3 += v1 << 8;
        t1 += t0 >>> 16;
        v0 = t0 & 65535;
        t2 += t1 >>> 16;
        v1 = t1 & 65535;
        v3 = (t3 + (t2 >>> 16)) & 65535;
        v2 = t2 & 65535;
        v0 ^= str.charCodeAt(i++);
    }

    while (i < l + 3) {
        t0 = v0 * 435;
        t1 = v1 * 435;
        t2 = v2 * 435;
        t3 = v3 * 435;
        t2 += v0 << 8;
        t3 += v1 << 8;
        t1 += t0 >>> 16;
        v0 = t0 & 65535;
        t2 += t1 >>> 16;
        v1 = t1 & 65535;
        v3 = (t3 + (t2 >>> 16)) & 65535;
        v2 = t2 & 65535;
        v0 ^= str.charCodeAt(i++);
    }

    return hl[v3 >> 8] + hl[v3 & 255] + hl[v2 >> 8] + hl[v2 & 255] + hl[v1 >> 8] + hl[v1 & 255] + hl[v0 >> 8] + hl[v0 & 255];
}

