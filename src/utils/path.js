const path = require("path");
const fse = require("fs-extra");
const log = require("./log");

const rootDir = () => {
	if (process.env.NODE_ENV == "testing") {
		return path.resolve(__dirname, "../../test/app/");
	} else return process.cwd();
};

const exists = path => fse.pathExistsSync(path);

const destroy = path => {
	if (exists(path)) {
		fse.removeSync(path);
		log.info(`Object deleted - ${path}`);
	} else log.warning(`Path does not exist - ${path}`);
};

const resolve = (objectPath, root = rootDir()) => {
	return path.resolve(root, objectPath);
};

module.exports = { rootDir, exists, destroy, resolve };
