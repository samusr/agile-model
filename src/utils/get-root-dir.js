const path = require("path");

/**
 * Returns the appropriate root directory based on the values of the process.env.NODE_ENV variable
 */
const getRootDir = () => path.join(process.cwd(), process.env.NODE_ENV == "development" ? "test/app/" : "/");

module.exports = getRootDir;
