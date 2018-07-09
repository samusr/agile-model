const path = require("path");
const { assert } = require("chai");
const utils = require("../../utils");

describe("Utils Tests", function() {
    let testFilePath = `${__dirname}\\test-file-1.test`;
    let testFolderPath = `${__dirname}\\test-folder-1`;

    before(async function() {
        await utils.deletePath(testFilePath);
        await utils.deletePath(testFolderPath);
    });

    after(async function() {
        await utils.deletePath(testFilePath);
        await utils.deletePath(testFolderPath);
    });

    it("it should match this platform", function() {
        assert.equal(utils.getPlatform(), process.platform);
    });

    it("should verify that file does not exist", function() {
        assert.notEqual(utils.pathExists(testFilePath), true);
    });

    it("should verify that folder does not exist", function() {
        assert.notEqual(utils.pathExists(testFolderPath), true);
    });

    it("should create a file", async function() {
        await utils.createFile(testFilePath);
        assert.equal(utils.pathExists(testFilePath), true);
    });

    it("should create a folder", async function() {
        await utils.createFolder(testFolderPath);
        assert.equal(utils.pathExists(testFolderPath), true);
    });

    it("should read a file", function(done) {
        utils
            .read(testFilePath)
            .then(function(err) {
                if (err) return done(err);
                done();
            })
            .catch(err => done(err));
    });

    it("should read folders at a path", async function() {
        let files = await utils.readFolders(path.join(process.cwd(), "/test/unit"));
        console.log(files);
        assert.notEqual(files.length, 0);
    });
});
