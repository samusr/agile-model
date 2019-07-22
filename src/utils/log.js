const chalk = require("chalk");
const consoleLog = console.log;

/** Contains logging functions of different levels */
module.exports = {
	info: message => consoleLog(chalk.cyan(message)),
	success: message => consoleLog(chalk.green(message)),
	warning: message => consoleLog(chalk.yellow.underline(message)),
	error: message => consoleLog(chalk.red.bold(message))
};
