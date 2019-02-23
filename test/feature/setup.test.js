const path = require("path");
const { assert } = require("chai");
const init = require("../../src/lib/init");
const setup = require("../../src/lib/setup");
const { pathExists, createFile, getRootDir, writeToFile, readFolder, deleteObject } = require("../../src/utils");

const cleanUpTestAppDir = () => {
    // Delete all files and folders in the test app directory
    const allPaths = readFolder(path.join(__dirname, "../app"));
    for (const _path of allPaths) deleteObject(path.join(__dirname, "../app/", _path));
    // Recreate the .gitignore file
    createFile(path.join(__dirname, "../app/.gitignore"));
    writeToFile(path.join(__dirname, "../app/.gitignore"), "*\n!.gitignore");
};

describe("Feature test for the setup command", () => {
    before(() => {
        process.env.NODE_ENV = "development";
        cleanUpTestAppDir();
    });

    after(cleanUpTestAppDir);

    it("should generate a agility.js file", () => {
        assert.doesNotThrow(async () => {
            await init();
            writeToFile(
                path.join(getRootDir(), "agility.js"),
                `module.exports = {
                    models: ["user", "post", "comment"],
                    relations: "user HAS_MANY [post comment], post HAS_MANY comment",
                    portals: ["admin", "user"]
                }`
            );
        });
    });

    it("should verify that the agility.js file was created", () => {
        assert.equal(pathExists(path.join(getRootDir(), "agility.js")), true);
    });

    it("should generate a project", () => {
        assert.doesNotThrow(async () => {
            await setup();
        });
    });

    it("should verify that all project folders were created", () => {
        const projectFolderPaths = [
            "dist",
            "logs",
            "src",
            "src/client",
            "src/server",
            "src/server/config",
            "src/server/routes",
            "src/server/services",
            "src/server/services/db"
        ];
        for (const _path of projectFolderPaths) {
            assert.equal(pathExists(path.join(getRootDir(), _path)), true);
        }
    });

    it("should verify that all project files were created", () => {
        const projectFilePaths = [
            "src/server/config/objection.js",
            "src/server/routes/index.js",
            "src/server/services/index.js",
            "src/server/services/db/index.js",
            "src/server/app.js",
            ".babelrc",
            ".eslintrc",
            ".gitignore",
            "knexfile.js",
            "migrate.bat",
            "nodemon.json",
            "package.json",
            "rollback.bat",
            "webpack.common.js",
            "webpack.dev.js",
            "webpack.prod.js"
        ];

        for (const _path of projectFilePaths) {
            assert.equal(pathExists(path.join(getRootDir(), _path)), true);
        }
    });

    it("should verify that all model files were created", () => {
        const modelFilePaths = [
            "src/server/models/user.js",
            "src/server/models/post.js",
            "src/server/models/comment.js",
            "src/server/services/db/user/create.js",
            "src/server/services/db/user/destroy.js",
            "src/server/services/db/user/edit.js",
            "src/server/services/db/user/find-all.js",
            "src/server/services/db/user/find-by-id.js",
            "src/server/services/db/user/find-where-conditions.js",
            "src/server/services/db/user/index.js",
            "src/server/services/db/post/create.js",
            "src/server/services/db/post/destroy.js",
            "src/server/services/db/post/edit.js",
            "src/server/services/db/post/find-all.js",
            "src/server/services/db/post/find-by-id.js",
            "src/server/services/db/post/find-by-user-id.js",
            "src/server/services/db/post/find-where-conditions.js",
            "src/server/services/db/post/index.js",
            "src/server/services/db/comment/create.js",
            "src/server/services/db/comment/destroy.js",
            "src/server/services/db/comment/edit.js",
            "src/server/services/db/comment/find-all.js",
            "src/server/services/db/comment/find-by-id.js",
            "src/server/services/db/comment/find-by-user-id.js",
            "src/server/services/db/comment/find-by-post-id.js",
            "src/server/services/db/comment/find-where-conditions.js",
            "src/server/services/db/comment/index.js"
        ];

        for (const _path of modelFilePaths) {
            assert.equal(pathExists(path.join(getRootDir(), _path)), true);
        }

        const migrationFiles = readFolder(path.join(getRootDir(), "src/server/migrations"), "file");
        assert.equal(migrationFiles.length, 3);
    });

    it("should verify that the webpack.common.js portal entries are correctly formed", () => {
        const webpackConfig = require(path.join(getRootDir(), "webpack.common.js"));
        assert.equal(webpackConfig.entry.admin, "./src/client/admin/index.js");
        assert.equal(webpackConfig.entry.user, "./src/client/user/index.js");
    });

    it("should verify that the verify that the dist folder was correctly built", () => {
        const distFolders = readFolder(path.join(getRootDir(), "dist"), "folder");
        assert.equal(distFolders.length, 2);
        assert.equal(distFolders[0], "admin");
        assert.equal(distFolders[1], "user");
    });
});
