const path = require("path");
const { log, writeToFile, createFile, renderEJS, getRootDir } = require("../../utils");

/**
 * Creates the agility.config.js file at the root of the project
 */
module.exports = () => {
	try {
		const folderRoot = getRootDir();
		const agilityFilePath = `${folderRoot}agility.js`;
		createFile(agilityFilePath);

		const templatePath = path.join(__dirname, "../../template/agility.js.ejs");
		writeToFile(agilityFilePath, renderEJS(templatePath));

		log(`Created agility.js @ ${folderRoot}`, "success");
	} catch (err) {
		log(err.message, "error");
	}
};
