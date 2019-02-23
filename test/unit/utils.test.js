const path = require("path");
const { assert } = require("chai");
const {
    pathExists,
    createFile,
    createFolder,
    writeToFile,
    readFile,
    readFolder,
    deleteObject,
    namesGenerator,
    getRootDir
} = require("../../src/utils");

const cleanUpTestAppDir = () => {
    // Delete all files and folders in the test utils directory
    const allPaths = readFolder(path.join(__dirname, "../utils"));
    for (const _path of allPaths) deleteObject(path.join(__dirname, "../utils/", _path));
    // Recreate the .gitignore file
    createFile(path.join(__dirname, "../utils/.gitignore"));
    writeToFile(path.join(__dirname, "../utils/.gitignore"), "*\n!.gitignore");
};

describe("Unit tests for utilities", () => {
    let testAppDirectory;
    const folderPaths = ["folder-1", "folder-2", "folder-3"];
    const filePaths = ["file-1", "file-2", "file-3"];
    const testString = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc luctus hendrerit nisl vel interdum.";

    before(() => {
        process.env.NODE_ENV = "development";
        testAppDirectory = path.join(getRootDir(), "../utils/");
        cleanUpTestAppDir();
    });

    after(cleanUpTestAppDir);

    it("should verify that test files and folders do not exist", () => {
        for (const path of [].concat(filePaths, folderPaths)) {
            assert.notEqual(pathExists(testAppDirectory + path), true);
        }
    });

    it("should create 3 files", () => {
        for (const path of filePaths) {
            assert.doesNotThrow(createFile.bind(null, testAppDirectory + path));
        }
    });

    it("should verify that files were created", () => {
        for (const path of filePaths) {
            assert.equal(pathExists(testAppDirectory + path), true);
        }
    });

    it("should create 3 folders", () => {
        for (const path of folderPaths) {
            assert.doesNotThrow(createFolder.bind(null, testAppDirectory + path));
        }
    });

    it("should verify that folders were created", () => {
        for (const path of folderPaths) {
            assert.equal(pathExists(testAppDirectory + path), true);
        }
    });

    it("should write to a file", () => {
        const path = testAppDirectory + filePaths[0];
        assert.doesNotThrow(writeToFile.bind(null, path, testString));
    });

    it("should verify that file was written to", () => {
        const path = testAppDirectory + filePaths[0];
        const content = readFile(path);
        assert.equal(testString, content);
    });

    it("should read folder contents", () => {
        const all = readFolder(testAppDirectory);
        assert.notEqual(all.length, 0);
    });

    it("should delete files and folders", () => {
        for (const path of [].concat(filePaths, folderPaths)) {
            assert.doesNotThrow(deleteObject.bind(null, testAppDirectory + path));
        }
    });

    it("should verify that files and folders have been deleted", () => {
        for (const path of [].concat(filePaths, folderPaths)) {
            assert.equal(pathExists(testAppDirectory + path), false);
        }
    });

    it("should generate model, table and file names for a given name", () => {
        assert.equal(namesGenerator.generateModelName("IndividualClient"), "IndividualClient");
        assert.equal(namesGenerator.generateModelFilename("IndividualClient"), "individual-client.js");
        assert.equal(namesGenerator.generateTablename("IndividualClient"), "individual_clients");
        assert.equal(namesGenerator.generateModelName("User"), "User");
        assert.equal(namesGenerator.generateModelFilename("User"), "user.js");
        assert.equal(namesGenerator.generateTablename("User"), "users");
    });

    it("should return the correct root folder for development environment", () => {
        process.env.NODE_ENV = "development";
        assert.equal(getRootDir(), path.join(process.cwd(), "test/app/"));
    });

    it("should return the correct root folder for production environment", () => {
        process.env.NODE_ENV = "production";
        assert.equal(getRootDir(), path.join(process.cwd(), "/"));
        process.env.NODE_ENV = "development";
    });
});
