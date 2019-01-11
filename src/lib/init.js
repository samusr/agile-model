const path = require("path");
const { log, writeToFile, createFile, renderEJS, getRootDir } = require("../utils");

/**
 * Creates the agility.config.js file at the root of the project
 */
module.exports = async () => {
    try {
        const folderRoot = getRootDir();
        const agilityFilePath = `${folderRoot}agility.js`;
        createFile(agilityFilePath);

        const templatePath = path.join(__dirname, "../template/agility.js.ejs");
        const output = await renderEJS(templatePath);
        writeToFile(agilityFilePath, output);

        log(`Created agility.js @ ${folderRoot}`, "success");
    } catch (err) {
        log(err.message, "error");
    }
};
