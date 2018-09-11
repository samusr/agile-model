/**
 * Creates a cmd spinner to indicate busy processes
 */
var Spinner = require("cli-spinner").Spinner;
var spinner = new Spinner();
spinner.setSpinnerString(0);
spinner.setSpinnerDelay(100);
module.exports = spinner;
