/**
 * This logs a formatted message to the console
 */
var log = console.log;
var chalk = require("chalk");
module.exports = function (message, level) {
    switch (level.toLowerCase()) {
        case "info":
            log(chalk.cyan(message));
            break;
        case "success":
            log(chalk.green(message));
            break;
        case "warning":
            log(chalk.yellow.underline(message));
            break;
        case "error":
            log(chalk.red.bold(message));
    }
};
