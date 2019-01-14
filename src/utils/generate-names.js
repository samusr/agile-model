const _ = require("lodash");
const pluralize = require("pluralize");

/**
 * For an entered string, getInitialCamelCase returns another string
 * which is the same as the input string only with the first letter
 * capitalized and each capital letter preceeded by a hyphen
 * @param {string} str String to be converted
 */
const getInitialCamelCase = str => {
    let temp = str.charAt(0);

    for (let i = 1; i < str.length; i++) {
        const char = str.charAt(i);
        temp += char.toLowerCase() != char ? "-" + char.toUpperCase() : char;
    }

    return temp;
};

/**
 * Generates a camel-cased modelname, model filename and tablename from the name given
 * @param {string} name The name from which to generate a model name
 */
const generateModelName = name => {
    const lowercasedModel = pluralize.singular(getInitialCamelCase(name)).toLowerCase();
    return lowercasedModel[0].toUpperCase() + _.camelCase(lowercasedModel.replace("-", "_")).substring(1);
};

/**
 * Generates a file name for the model
 * @param {string} name The name from which to generate a file name for a model
 */
const generateModelFilename = name => {
    const lowercasedModel = pluralize.singular(getInitialCamelCase(name)).toLowerCase();
    return lowercasedModel + ".js";
};

/**
 * Generates the database tablename for this model
 * @param {string} name The name from which to generate a database tablename for a model
 */
const generateTablename = name => {
    const lowercasedModel = pluralize.singular(getInitialCamelCase(name)).toLowerCase();
    return pluralize(lowercasedModel)
        .replace(/-/g, "_")
        .toLowerCase();
};

const nameGenerator = { generateModelName, generateModelFilename, generateTablename, getInitialCamelCase };

module.exports = nameGenerator;
