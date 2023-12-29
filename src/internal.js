
/**
 * Valid clients
 * - There are more clients than these, but only listed those that are really useful.
 * @type {{TRANQUILITY: string, SISI: string}}
 */
export const Clients = {
    TRANQUILITY: "tq",
    SISI: "sisi"
}

/**
 * Validates a client
 * @param {String} client
 * @returns {string}
 */
export function validateClient(client){
    client = client.toLowerCase();
    for (const key in Clients)
    {
        if (Clients.hasOwnProperty(key) && Clients[key].toLowerCase() === client) return client;
    }
    throw new Error(`Invalid client: ${client}`);
}


/**
 * Converts a text resfileindex to an array of arrays
 * @param {String} text
 * @returns {Array<Array<String|Number>>}
 */
export function txtResFileIndexToArray(text) {
    const lines = text
        .toLowerCase()
        .split(/\r?\n/)
        .filter(x=>x)
        .sort((a, b) => a.localeCompare(b));

    const out = [];
    for (let i = 0; i < lines.length; i++) {
        const [name, path, md5, size, compressedSize, appFile] = lines[i].split(",");
        const result = [name, path, md5, Number(size), Number(compressedSize)];
        if (appFile) result.push(Number(appFile));
        out.push(result);
    }
    return out;
}
