const nodePath = require("path");
const { file, path } = require("../utils");

/**
 * Creates the agility.config.js file at the root of the project
 */
module.exports = function() {
	try {
		const agilityFilePath = path.resolve("agility.js");
		const templatePath = nodePath.join(__dirname, "../template/agility.js.ejs");
		const content = file.render(templatePath);
		file.create(agilityFilePath);
		file.write(agilityFilePath, content);
	} catch (err) {
		console.error(err);
	}
};
