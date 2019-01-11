const path = require("path");
const fse = require("fs-extra");
const { assert } = require("chai");
const init = require("../../src/lib/init");
const { pathExists, getRootDir, readFile, renderEJS } = require("../../src/utils");

describe("Unit test for the init command", () => {
    let agilityPath;

    before(() => {
        process.env.NODE_ENV = "development";
        agilityPath = path.join(getRootDir(), "agility.js");
    });

    after(() => {
        fse.removeSync(agilityPath);
    });

    it("should create an agility at the test project root", () => {
        assert.doesNotThrow(init);
    });

    it("should verify that agility.js was created at test project root", () => {
        assert.equal(pathExists(agilityPath), true);
    });

    it("should verify that agility.js content is as the template file", async () => {
        const templateContent = await renderEJS(path.join(__dirname, "../../src/template/agility.js.ejs"));
        const fileContent = readFile(agilityPath);
        assert.equal(templateContent, fileContent);
    });
});
