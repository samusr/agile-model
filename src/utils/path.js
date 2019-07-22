const fse = require("fs-extra");
const log = require("./log");

const exists = path => fse.pathExistsSync(path);

const destroy = path => {
	if (exists(path)) {
		fse.removeSync(path);
		log.info(`Object deleted - ${path}`);
	} else log.warning(`Path does not exist - ${path}`);
};

module.exports = { exists, destroy };
