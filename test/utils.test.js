const nodePath = require("path");
const { assert } = require("chai");
const { file, folder, path, name } = require("../src/utils");
const UTILS_TEST_DIR = nodePath.resolve(__dirname, "utils") + "/";

describe("Unit tests for utilities", () => {
	const folderPaths = ["folder-1", "folder-2", "folder-3"];
	const filePaths = ["file-1", "file-2", "file-3"];
	const testString = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc luctus hendrerit nisl vel interdum.";

	function reset() {
		// Delete all files and folders in the test directory
		const objectPaths = folder.read(UTILS_TEST_DIR);
		for (const objectPath of objectPaths) path.destroy(UTILS_TEST_DIR + objectPath);
		// Recreate the .gitignore file
		file.create(UTILS_TEST_DIR + ".gitignore");
		file.write(UTILS_TEST_DIR + ".gitignore", "*\n!.gitignore");
	}

	before(reset);
	after(reset);

	it("should verify that test files and folders do not exist", () => {
		for (const objectPath of [].concat(filePaths, folderPaths)) {
			assert.notEqual(path.exists(UTILS_TEST_DIR + objectPath), true);
		}
	});

	it("should create 3 files", () => {
		for (const path of filePaths)
			assert.doesNotThrow(function() {
				file.create(UTILS_TEST_DIR + path);
			});
	});

	it("should verify that files were created", () => {
		for (const objectPath of filePaths) {
			assert.equal(path.exists(UTILS_TEST_DIR + objectPath), true);
		}
	});

	it("should create 3 folders", () => {
		for (const objectPath of folderPaths)
			assert.doesNotThrow(function() {
				folder.create(UTILS_TEST_DIR + objectPath);
			});
	});

	it("should verify that folders were created", () => {
		for (const objectPath of folderPaths) {
			assert.equal(path.exists(UTILS_TEST_DIR + objectPath), true);
		}
	});

	it("should write to a file", () => {
		assert.doesNotThrow(function() {
			file.write(UTILS_TEST_DIR + filePaths[0], testString);
		});
	});

	it("should verify that file was written to", () => {
		assert.equal(file.read(UTILS_TEST_DIR + filePaths[0]), testString);
	});

	it("should read folder contents", () => {
		assert.notEqual(folder.read(UTILS_TEST_DIR).length, 0);
	});

	it("should delete files and folders", () => {
		for (const objectPath of [].concat(filePaths, folderPaths)) {
			assert.doesNotThrow(function() {
				path.destroy(UTILS_TEST_DIR + objectPath);
			});
		}
	});

	it("should verify that files and folders have been deleted", () => {
		for (const objectPath of [].concat(filePaths, folderPaths)) {
			assert.equal(path.exists(UTILS_TEST_DIR + objectPath), false);
		}
	});

	it("should generate model, table and file names for a given name", () => {
		assert.equal(name.modelName("IndividualClient"), "IndividualClient");
		assert.equal(name.modelFilename("IndividualClient"), "individual-client.js");
		assert.equal(name.modelTablename("IndividualClient"), "individual_clients");
		assert.equal(name.modelName("User"), "User");
		assert.equal(name.modelFilename("User"), "user.js");
		assert.equal(name.modelTablename("User"), "users");
		assert.equal(name.modelName("new-model"), "NewModel");
		assert.equal(name.modelFilename("new-model"), "new-model.js");
		assert.equal(name.modelTablename("new-model"), "new_models");
	});
});
