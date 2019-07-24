const { file, path } = require("../utils");

module.exports = function() {
	try {
		const agilityFilePath = path.resolve("agility.js");
		const templatePath = path.resolve("../template/agility.js.ejs", __dirname);
		const content = file.render(templatePath);

		file.create(agilityFilePath);
		file.write(agilityFilePath, content);
	} catch (err) {
		console.error(err);
	}
};
