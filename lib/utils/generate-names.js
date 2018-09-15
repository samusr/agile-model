const _ = require("lodash");
const pluralize = require("pluralize");

/**
 * Generates a camel-cased modelname, model filename and tablename from the name given
 */
const generateModelName = name => {
    const lowercasedModel = pluralize.singular(name).toLowerCase();
    return _.capitalize(lowercasedModel[0]) + _.camelCase(lowercasedModel.replace("-", "_")).substring(1);
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
        if (str.charAt(i).toLowerCase() != str.charAt(i)) {
            temp = temp + "-" + str.charAt(i).toUpperCase();
        } else {
            temp = temp + str.charAt(i);
        }
    }

    return temp;
};

module.exports = { generateModelName, generateModelFilename, generateTablename, getInitialCamelCase };
