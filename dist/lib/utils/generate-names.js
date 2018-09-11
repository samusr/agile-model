var _ = require("lodash");
var pluralize = require("pluralize");
/**
 * Generates a camel-cased model name from the name given
 */
var generateModelName = function (name) {
    var lowercasedModel = pluralize.singular(name).toLowerCase();
    return _.capitalize(lowercasedModel[0]) + _.camelCase(lowercasedModel.replace("-", "_")).substring(1);
};
/**
 * Generates a file name for the model
 */
var generateModelFilename = function (name) {
    var lowercasedModel = pluralize.singular(name).toLowerCase();
    return lowercasedModel + ".js";
};
/**
 * Generates the database tablename for this model
 */
var generateTablename = function (name) {
    var lowercasedModel = pluralize.singular(name).toLowerCase();
    return pluralize(lowercasedModel)
        .replace("-", "_")
        .toLowerCase();
};
var getInitialCamelCase = function (str) {
    var temp = str.charAt(0);
    for (var i = 1; i < str.length; i++) {
        if (str.charAt(i).toLowerCase() != str.charAt(i)) {
            temp = temp + "-" + str.charAt(i).toUpperCase();
        }
        else {
            temp = temp + str.charAt(i);
        }
    }
    return temp;
};
module.exports = { generateModelName: generateModelName, generateModelFilename: generateModelFilename, generateTablename: generateTablename, getInitialCamelCase: getInitialCamelCase };
