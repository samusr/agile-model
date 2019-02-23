const path = require("path");

/**
 * Returns the appropriate root directory
 */
const getRootDir = () => {
    return path.join(process.cwd(), process.env.NODE_ENV == "development" ? "test/app/" : "/");
};

module.exports = getRootDir;
