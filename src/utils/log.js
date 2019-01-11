const chalk = require("chalk");
const consoleLog = console.log;

/**
 * This logs a formatted message to the console
 */
const log = (message, level) => {
    if (level == null) level = "info";

    switch (level.toLowerCase()) {
        case "info":
            consoleLog(chalk.cyan(message));
            break;
        case "success":
            consoleLog(chalk.green(message));
            break;
        case "warning":
            consoleLog(chalk.yellow.underline(message));
            break;
        case "error":
            consoleLog(chalk.red.bold(message));
    }
};

module.exports = log;
