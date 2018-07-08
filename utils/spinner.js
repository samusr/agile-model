/**
 * Creates a cmd spinner to indicate busy processes
 */

const Spinner = require("cli-spinner").Spinner;
const spinner = new Spinner();

spinner.setSpinnerString(0);
spinner.setSpinnerDelay(100);

module.exports = spinner;
