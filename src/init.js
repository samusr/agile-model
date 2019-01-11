const path = require("path");
const { log, writeToFile, createFile, renderEJS, getRootDir } = require("./utils");

/**
 * Creates the agility.config.js file at the root of the project
 */
module.exports = async function() {
	try {
		let agilityFilePath = `${getRootDir()}agility.js`;
		await createFile(agilityFilePath);

		let content = await renderEJS(path.join(__dirname, "../template/agility.js.ejs"), {});
		await writeToFile(agilityFilePath, content);

		log("Done!", "success");
	} catch (err) {
		log(err.message, "error");
	}
};
