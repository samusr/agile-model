const path = require("path");
// const generate = require("./generate");
// const generateModelGraph = require("./generate-model-graph");
const { renderEJS, getRootDir, log, createFile, createFolder, writeToFile } = require("./utils");

/**
 * Configures the project foder
 */
module.exports = async function() {
	try {
		await configurePackageJSON();
		await configureKnex();
		await configureObjection();
		await createServerStructure();
		await createClientFolder();
		await createAdditionalFiles();

		// // Create additional files folders

		// // Process agility.js (If any)
		// await processAgilityConfig(args);

		log(`\nRun "knex migrate:latest" to execute the latest migrations`, "info");
	} catch (err) {
		log(err, "error");
	}
};

const configurePackageJSON = () => {
	return new Promise(async (resolve, reject) => {
		try {
			const knexfilePath = `${getRootDir()}package.json`;
			await createFile(knexfilePath);

			const templatePath = path.join(__dirname, "../template/package.json.ejs");
			const content = await renderEJS(templatePath);

			await writeToFile(knexfilePath, content);

			log("Knex configuration complete", "success");
			return resolve();
		} catch (err) {
			return reject(err);
		}
	});
};

const configureKnex = () => {
	return new Promise(async (resolve, reject) => {
		try {
			const knexfilePath = `${getRootDir()}knexfile.js`;
			await createFile(knexfilePath);

			const templatePath = path.join(__dirname, "../template/knexfile.js.ejs");
			const content = await renderEJS(templatePath);

			await writeToFile(knexfilePath, content);

			log("Knex configuration complete", "success");
			return resolve();
		} catch (err) {
			return reject(err);
		}
	});
};

const configureObjection = () => {
	return new Promise(async (resolve, reject) => {
		try {
			const configFolderPath = `${getRootDir()}src/server/config`;
			const objectionConfigFilePath = `${getRootDir()}src/server/config/objection.js`;
			await createFolder(configFolderPath);
			await createFile(objectionConfigFilePath);

			const objectionTemplatePath = path.join(__dirname, "../template/server/config/objection.js.ejs");
			let content = await renderEJS(objectionTemplatePath);

			await writeToFile(objectionConfigFilePath, content);

			log("Objection configuration complete", "success");
			return resolve();
		} catch (err) {
			return reject(err);
		}
	});
};

const createServerStructure = () => {
	return new Promise(async (resolve, reject) => {
		try {
			const rootDir = path.join(getRootDir(), "src/server/");
			const servicesIndexFilePath = `${rootDir}services/index.js`;
			const dbIndexFilePath = `${rootDir}services/db/index.js`;
			const appFilePath = `${rootDir}app.js`;

			const createPromises = [
				createFolder(`${rootDir}/models`),
				createFolder(`${rootDir}/migrations`),
				createFolder(`${rootDir}/services`),
				createFolder(`${rootDir}/services/db`),
				createFile(servicesIndexFilePath),
				createFile(dbIndexFilePath),
				createFile(appFilePath)
			];

			await Promise.all(createPromises);

			const readPromises = [
				renderEJS(path.join(__dirname, "../template/server/services/index.js.ejs")),
				renderEJS(path.join(__dirname, "../template/server/services/db/index.js.ejs")),
				renderEJS(path.join(__dirname, "../template/server/app.js.ejs"))
			];

			const content = await Promise.all(readPromises);

			const writePromises = [
				writeToFile(servicesIndexFilePath, content[0]),
				writeToFile(dbIndexFilePath, content[1]),
				writeToFile(appFilePath, content[2])
			];

			await Promise.all(writePromises);

			log("Finished structuring server folder", "success");
			return resolve();
		} catch (err) {
			return reject(err);
		}
	});
};

const createClientFolder = () => {
	return new Promise(async (resolve, reject) => {
		try {
			await createFolder(`${getRootDir()}/src/client/`);
			log("Finished creating client folder", "success");
			return resolve();
		} catch (err) {
			return reject(err);
		}
	});
};

const createAdditionalFiles = () => {
	return new Promise(async (resolve, reject) => {
		try {
			const babelrcPath = `${getRootDir()}.babelrc`;
			const eslintrcPath = `${getRootDir()}.eslintrc`;
			const babelrcTemplatePath = path.join(__dirname, "../template/.babelrc.ejs");
			const eslintrcTemplatePath = path.join(__dirname, "../template/.eslintrc.ejs");

			const createPromises = [createFile(babelrcPath), createFile(eslintrcPath)];
			await Promise.all(createPromises);

			const readPromises = [renderEJS(babelrcTemplatePath), renderEJS(eslintrcTemplatePath)];
			const content = await Promise.all(readPromises);

			const writePromises = [writeToFile(babelrcPath, content[0]), writeToFile(eslintrcPath, content[1])];
			await Promise.all(writePromises);

			if (process.env.NODE_ENV != "development") {
				const gitignorePath = `${getRootDir()}.babelrc`;
				const gitignoreTemplatePath = path.join(__dirname, "../template/.gitignore.ejs");

				await createFile(`${getRootDir()}.gitignore`);
				const gitContent = await renderEJS(gitignoreTemplatePath);
				await writeToFile(gitignorePath, gitContent);
			}

			log("Finished creating additional files", "success");
			return resolve();
		} catch (err) {
			return reject(err);
		}
	});
};

// function processAgilityConfig(args) {
// 	return new Promise(async function(resolve, reject) {
// 		try {
// 			log.info("Processing agility.config.js");

// 			let agilityConfigPath = path.join(process.cwd(), "/agility.js");

// 			if (!pathExists(agilityConfigPath)) {
// 				log.info(`No agility.js file found in root. If you want to use this file, please run "agile-model init"`);
// 				return resolve();
// 			}

// 			let agilityConfig = require(agilityConfigPath);
// 			let models = agilityConfig.models;
// 			let relationString = agilityConfig.relations;

// 			// Generate model graph
// 			let modelGraph = generateModelGraph(models, relationString);

// 			for (let model of modelGraph) {
// 				await generate(model, args);
// 			}

// 			log.info("Finished processing agility.js");
// 			return resolve();
// 		} catch (err) {
// 			return reject(err);
// 		}
// 	});
// }
