const path = require("path");
const fse = require("fs-extra");
const pathExists = require("./path-exists");
const log = require("./log");

/**
 * This module returns an array of paths of all folders at particular search path.
 * The search path must be a folder path.
 *
 * @param {string} path The path to search
 * @param {string} mode Indicates what type of content to look for in a folders. Values are "folder", "file" and "all"
 *
 * @returns {string[]} An array of filenames existing in the folder
 */
const readFolder = (folderPath, mode = "all") => {
	if (!pathExists(folderPath)) {
		log("Search path does not exist. Empty array returned", "warning");
		return [];
	}

	if (!fse.lstatSync(folderPath).isDirectory()) {
		log("Search path is not a directory. Empty array returned", "warning");
		return [];
	}

	const folderContents = fse.readdirSync(folderPath, { encoding: "utf-8" });

	return folderContents.filter(content => {
		const contentStats = fse.lstatSync(path.join(folderPath, content));
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

module.exports = readFolder;
