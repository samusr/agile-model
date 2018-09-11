const path = require("path");
const fse = require("fs-extra");
const { assert } = require("chai");
const { pathExists, createFile, createFolder, writeToFile, readFile, readFolder, deleteFile } = require("../dist/lib/utils");

describe("Unit tests for utilities", () => {
	let testAppDirectory = path.join(__dirname, "./app/content/");
	let folderPaths = ["folder-1", "folder-2", "folder-3"];
	let filePaths = ["file-1", "file-2", "file-3"];
	let testString = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc luctus hendrerit nisl vel interdum.";

	before(async () => {
		// Delete everything in testAppDirectory
		fse.emptyDirSync(testAppDirectory);
	});

	it("should verify that file does not exist", () => {
		const path = testAppDirectory + filePaths[0];
		assert.notEqual(pathExists(path), true);
	});

	it("should verify that folder does not exist", () => {
		const path = testAppDirectory + folderPaths[0];
		assert.notEqual(pathExists(path), true);
	});

	it("should create 3 files", async () => {
		for (let path of filePaths) {
			await createFile(testAppDirectory + path);
			assert.equal(pathExists(testAppDirectory + path), true);
		}
	});

	it("should create 3 folders", async () => {
		for (let path of folderPaths) {
			await createFolder(testAppDirectory + path);
			assert.equal(pathExists(testAppDirectory + path), true);
		}
	});

	it("should write to a file", async () => {
		const path = testAppDirectory + filePaths[0];
		assert.doesNotThrow(async () => {
			await writeToFile(path, testString);
		});
	});

	it("should verify that file was written to", async () => {
		const path = testAppDirectory + filePaths[0];
		let content = await readFile(path);
		assert.equal(testString, content);
	});

	it("should read folder", async () => {
		let files = await readFolder(testAppDirectory);
		assert.notEqual(files.length, 0);
	});

	it("should delete files and folders", async () => {
		for (let path of [].concat(filePaths, folderPaths)) {
			await deleteFile(testAppDirectory + path);
		}
	});

	it("should verify that files and folders have been deleted", async () => {
		for (let path of [].concat(filePaths, folderPaths)) {
			assert.notEqual(pathExists(testAppDirectory + path), true);
		}
	});
});
