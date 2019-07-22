const nodePath = require("path");
const { file, path } = require("../../utils");

/**
 * Creates the agility.config.js file at the root of the project
 */
module.exports = function() {
	try {
		const APP_ROOT = path.rootDir();
		const agilityFilePath = APP_ROOT + "agility.js";
		const agilityTemplatePath = nodePath.join(__dirname, "../../template/agility.js.ejs");
		file.create(agilityFilePath);
		file.write(agilityFilePath, file.render(agilityTemplatePath));
	} catch (err) {
		console.error(err);
	}
};
