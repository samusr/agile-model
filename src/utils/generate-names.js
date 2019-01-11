const _ = require("lodash");
const pluralize = require("pluralize");

/**
 * Generates a camel-cased model name from the name given
 */
const generateModelName = name => {
    const lowercasedModel = pluralize.singular(name).toLowerCase();
    return lowercasedModel[0].toUpperCase() + _.camelCase(lowercasedModel.replace("-", "_")).substring(1);
};

/**
 * Generates a file name for the model
 */
const generateModelFilename = name => {
    const lowercasedModel = pluralize.singular(name).toLowerCase();
    return lowercasedModel + ".js";
};

/**
 * Generates the database tablename for this model
 */
const generateTablename = name => {
    const lowercasedModel = pluralize.singular(name).toLowerCase();
    return pluralize(lowercasedModel)
        .replace(/-/g, "_")
        .toLowerCase();
};

const getInitialCamelCase = str => {
    let temp = str.charAt(0);

    for (let i = 1; i < str.length; i++) {
        const char = str.charAt(i);
        temp += char.toLowerCase() != char ? "-" + char.toUpperCase() : char;
    }

    return temp;
};

const nameGenerator = { generateModelName, generateModelFilename, generateTablename, getInitialCamelCase };

module.exports = nameGenerator;
