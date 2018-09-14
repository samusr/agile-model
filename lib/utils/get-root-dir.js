const path = require("path");

/**
 * Returns the appropriate root directory
 */
module.exports = () => {
	if (process.env.NODE_ENV == "development") {
		return path.join(process.cwd(), "test/app/");
	} else {
		return path.join(process.cwd(), "/");
	}
};
