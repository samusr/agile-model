module.exports = {
    read: require("./read"),
    write: require("./write"),
    createFile: require("./create-file"),
    createFolder: require("./create-folder"),
    deletePath: require("./delete-file"),
    pathExists: require("./path-exists"),
    getPlatform: require("./get-platform"),
    log: require("./log"),
    spinner: require("./spinner"),
    promisifyEjs: require("./promisify-ejs")
};
