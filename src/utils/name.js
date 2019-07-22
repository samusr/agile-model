const { camelCase } = require("lodash");
const pluralize = require("pluralize");

/**
 * Returns a camel-cased version of str with the first letter capitalized
 * and subsequent capital letters preceeded by a hyphen.
 *
 * E.g. "hello world" => "Hello-World"
 * @param {string} str String to be converted
 */
const initialCamelCase = str => {
	return str.split("").reduce((acc, c) => {
		if (c.toLowerCase() != c) {
			return acc + (acc ? "-" : "") + c.trim().toUpperCase();
		} else return acc + c.trim();
	}, "");
};

/**
 * Generates a camel-cased model name from the given name
 * @param {string} name The name from which to generate a model name
 */
const modelName = name => {
	const n = pluralize.singular(initialCamelCase(name)).toLowerCase();
	return n[0].toUpperCase() + camelCase(n).substring(1);
};

/**
 * Generates a file name for the model
 * @param {string} name The name from which to generate a file name for a model
 */
const modelFilename = name => pluralize.singular(initialCamelCase(name)).toLowerCase() + ".js";

/**
 * Generates the database tablename for this model
 * @param {string} name The name from which to generate a database tablename for a model
 */
const modelTablename = name => {
	const n = pluralize.singular(initialCamelCase(name)).toLowerCase();
	return pluralize(n).replace(/-/g, "_");
};

module.exports = { modelName, modelFilename, modelTablename, initialCamelCase };
