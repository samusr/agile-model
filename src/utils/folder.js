const fse = require("fs-extra");
const nodePath = require("path");
const agilePath = require("./path");
const log = require("./log");

const create = path => {
	fse.ensureDirSync(path);
	log.info(`Folder created - ${path}`);
};

const read = (path, mode = "all") => {
	if (!agilePath.exists(path)) {
		log.warning(`Path does not exist - ${path}`, "warning");
		return [];
	}

	if (!fse.lstatSync(path).isDirectory()) {
		log("Search path is not a directory. Empty array returned", "warning");
		return [];
	}

	const folderContents = fse.readdirSync(path, { encoding: "utf-8" });

	return folderContents.filter(content => {
		const contentStats = fse.lstatSync(nodePath.join(path, content));
		switch (mode.toLowerCase()) {
			case "folder":
				return contentStats.isDirectory();
			case "file":
				return contentStats.isFile();
			default:
				return true;
		}
	});
};

module.exports = { create, read };
