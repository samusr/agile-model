const fs = require("fs");
const ejs = require("ejs");

/**
 * Renders an ejs file with given params and returns the rendered string
 * @param path Path to ejs file
 * @param params Parameters to be sent to the renderer
 */
const renderEJS = (path, params = {}) => ejs.render(fs.readFileSync(path, "utf-8"), params);

module.exports = renderEJS;
