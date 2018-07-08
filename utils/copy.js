const log = require("./log");
const fse = require("fs-extra");

/**
 * Asynchronously copies a file or files from a source directory to a target directory.
 * If src is an array, then dest must also be an array of the same length as src which is an array
 * of corresponding paths
 *
 * @param src Path or array of paths of source files
 * @param dest Path or array of paths of destination
 */

module.exports = function(src, dest) {
    return new Promise(function(resolve, reject) {
        try {
            if (Array.isArray(src)) {
                // Array of files
                for (let i = 0; i < src.length; i++) {
                    let srcPath = src[i];
                    let destPath = dest[i];

                    fse.copyFileSync(srcPath, destPath);
                }

                log.info(`${src.length} files copied!`);
            } else {
                // Single file
                fse.copyFileSync(src, dest);
                log.info("File copied");
            }

            return resolve();
        } catch (err) {
            return reject(err);
        }
    });
};
