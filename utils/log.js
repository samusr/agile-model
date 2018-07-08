/**
 * This module provides various levels of console logging
 */

const log = console.log;
const chalk = require("chalk");

module.exports = {
    info: function(message) {
        log(chalk.cyan(message));
    },
    success: function(message) {
        log(chalk.green(message));
    },
    warning: function(message) {
        log(chalk.magenta.underline(message));
    },
    error: function(message) {
        log(chalk.red.bold(message));
    }
};
