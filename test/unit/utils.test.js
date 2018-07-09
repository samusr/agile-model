const { assert } = require("chai");
const utils = require("../../utils");

describe("Utils Tests", function() {
    let testFilePath = `${__dirname}\\test-file-1.test`;
    let testFolderPath = `${__dirname}\\test-folder-1`;
    let copyTestSrcPaths = [`${__dirname}\\test-file-20.test`, `${__dirname}\\test-file-21.test`];
    let copyTestDestPaths = [`${__dirname}\\copy\\test-file-20.test`, `${__dirname}\\copy\\test-file-21.test`];

    before(async function() {
        await utils.createFolder(`${__dirname}\\copy`);

        for (let path of copyTestSrcPaths) {
            await utils.createFile(path);
        }
    });

    after(async function() {
        await utils.deletePath(testFilePath);
        await utils.deletePath(testFolderPath);

        for (let path of copyTestSrcPaths.concat(copyTestDestPaths)) {
            await utils.deletePath(path);
        }

        await utils.deletePath(`${__dirname}\\copy`);
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
            .read(copyTestDestPaths[0])
            .then(function(err) {
                if (err) return done(err);
                done();
            })
            .catch(err => done(err));
    });
});
