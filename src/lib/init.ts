/**
 * Creates the agility.config.js file at the root of the project
 */

const path = require("path");
const { log, write, createFile, promisifyEjs } = require("./utils");

module.exports = async function() {
	try {
		let agilityConfigPath = path.join(process.cwd(), "/agility.js");
		await createFile(agilityConfigPath);

		let content = await promisifyEjs(path.join(__dirname, "../template/agility.js.ejs"), {});
		await write(agilityConfigPath, content);

		log.info("agility.js created!");
	} catch (err) {
		log.error(err);
	}
};
