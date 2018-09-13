module.exports = (function () {
    var _a = require("../utils").generateNames, generateModelName = _a.generateModelName, generateModelFilename = _a.generateModelFilename, generateTablename = _a.generateTablename, getInitialCamelCase = _a.getInitialCamelCase;
    var Model = /** @class */ (function () {
        function Model(name) {
            var _name = getInitialCamelCase(name).trim();
            this.modelName = generateModelName(_name);
            this.modelFilename = generateModelFilename(_name);
            this.tablename = generateTablename(_name);
        }
        return Model;
    }());
    return Model;
})();
