const path = require("path");
const { assert } = require("chai");
const { createPortal, setup } = require("../../src/lib/core");
const { pathExists, createFile, getRootDir, writeToFile, readFolder, deleteObject } = require("../../src/utils");

const cleanUpTestAppDir = () => {
	// Delete all files and folders in the test app directory
	const allPaths = readFolder(path.join(__dirname, "../app"));
	for (const _path of allPaths) deleteObject(path.join(__dirname, "../app/", _path));
	// Recreate the .gitignore file
	createFile(path.join(__dirname, "../app/.gitignore"));
	writeToFile(path.join(__dirname, "../app/.gitignore"), "*\n!.gitignore");
};

describe("Feature test for the create-portal command", () => {
	let portalName;

	before(() => {
		portalName = "backoffice";
		process.env.NODE_ENV = "development";
		// Setup should be run before any portals can be created
		cleanUpTestAppDir();
	});

	after(cleanUpTestAppDir);

	it("should create a new portal called 'backoffice'", () => {
		setup();
		assert.doesNotThrow(createPortal.bind(null, portalName));
	});

	it("should verify that all portal files were created", () => {
		const portalFilePaths = [
			`dist/${portalName}/index.ejs`,
			`src/client/${portalName}/actions/flash-actions.js`,
			`src/client/${portalName}/actions/loading-actions.js`,
			`src/client/${portalName}/config/action-types.js`,
			`src/client/${portalName}/config/loading-entries.js`,
			`src/client/${portalName}/config/url.js`,
			`src/client/${portalName}/pages/404/index.jsx`,
			`src/client/${portalName}/pages/base/index.jsx`,
			`src/client/${portalName}/pages/components/auth-container/index.jsx`,
			`src/client/${portalName}/pages/components/flash/index.jsx`,
			`src/client/${portalName}/pages/components/flash/index.scss`,
			`src/client/${portalName}/pages/components/page-container/index.jsx`,
			`src/client/${portalName}/pages/components/index.js`,
			`src/client/${portalName}/pages/login/index.jsx`,
			`src/client/${portalName}/pages/login/index.scss`,
			`src/client/${portalName}/pages/login/login-form.jsx`,
			`src/client/${portalName}/pages/login/login-form.scss`,
			`src/client/${portalName}/reducers/flash-reducer.js`,
			`src/client/${portalName}/reducers/index.js`,
			`src/client/${portalName}/reducers/loading-reducer.js`,
			`src/client/${portalName}/index.js`,
			`src/client/${portalName}/index.scss`
		];

		for (const _path of portalFilePaths) {
			assert.equal(pathExists(path.join(getRootDir(), _path)), true);
		}
	});
});
