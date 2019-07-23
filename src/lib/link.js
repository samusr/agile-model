const esprima = require("esprima");
const { Model, Relation } = require("../models");
const { log, path, file } = require("../utils");

module.exports = function(lModelName, rModelName, { relationType }) {
	try {
		const relation = new Relation(relationType);
		const lModel = new Model(lModelName);
		const rModel = new Model(rModelName);

		// Check if models exist
		if (!lModel.existsInProject()) throw new Error(`Model does not exist - ${lModel.name}`);
		if (!rModel.existsInProject()) throw new Error(`Model does not exist - ${rModel.name}`);

		// If models are not already related, inject the appropriate relations into both files
		if (!lModel.isRelatedTo(rModel, relation.type) || lModel.isRelatedTo(rModel, relation.reverseType)) {
		}
	} catch (err) {
		log.error(err);
		return process.exit(-1);
	}
};

// function modelIsRelated(lModelName, rModelName) {
// 	const lModel = new Model(lModelName);
// 	const lModelPath = path.rootDir() + "src/server/models/" + lModel.filename;
// 	const lModelCodeProperties = [];
// 	esprima.parseScript(file.read(lModelPath), null, function(node) {
// 		if (node.type == "Property") lModelCodeProperties.push(node);
// 	});

// 	const rModel = new Model(rModelName);
// 	const fileNameRegex = /(^[\w|-]+)?([\w|-]+)(\\.js)?/;
// 	const dependency = lModelCodeProperties.filter(property => {
// 		try {
// 			return (
// 				property.value.type == "CallExpression" &&
// 				property.value.callee.name == "require" &&
// 				property.value.arguments[0].type == "Literal" &&
// 				fileNameRegex.exec(property.value.arguments[0].value)[0] == fileNameRegex.exec(rModel.filename)[0]
// 			);
// 		} catch (err) {
// 			return false;
// 		}
// 	})[0];

// 	return !!dependency;
// }

// function injectRelationCode(lModelName, rModelName, relationType) {}
