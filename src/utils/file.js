const ejs = require("ejs");
const fse = require("fs-extra");
const log = require("./log");

const create = path => {
	fse.ensureFileSync(path);
	log.info(`File created - ${path}`);
};

const read = path => fse.readFileSync(path, { encoding: "utf-8" });

const write = (path, data = "") => {
	fse.writeFileSync(path, data);
	log.info(`File written - ${path}`);
};

const render = (path, params = {}) => ejs.render(read(path), params);

module.exports = { create, read, write, render };
