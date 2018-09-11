module.exports = (function () {
    var RelationType = /** @class */ (function () {
        function RelationType(type) {
            this.type = type;
        }
        RelationType.prototype.getReverse = function () {
            switch (this.type) {
                case "HAS_ONE":
                case "HAS_MANY":
                    return "BELONGS_TO_ONE";
                case "MANY_TO_MANY":
                    return "MANY_TO_MANY";
                default:
                    throw new Error("Unsupported relation type [" + this.type + "]");
            }
        };
        return RelationType;
    }());
    var Relation = /** @class */ (function () {
        // @ts-ignore: Cannot find Model
        function Relation(sourceModel, dependentModel, relationType) {
            this.sourceModel = sourceModel;
            this.relationType = relationType;
            this.dependentModels = dependentModel ? [dependentModel] : [];
        }
        // @ts-ignore: Cannot find Model
        Relation.prototype.addDependentModel = function (dependentModel) {
            for (var _i = 0, _a = this.dependentModels; _i < _a.length; _i++) {
                var m = _a[_i];
                if (m == dependentModel)
                    return;
            }
            this.dependentModels.push(dependentModel);
        };
        Relation.prototype.toString = function () {
            return "Source: " + this.sourceModel.modelName + "\nType: " + this.relationType.type + "\nDependents: [" + this.dependentModels.reduce(function (acc, model) { return acc + " " + model.modelName + ","; }, "") + "]\n";
        };
        return Relation;
    }());
    var HAS_ONE = new RelationType("HAS_ONE");
    var HAS_MANY = new RelationType("HAS_MANY");
    return { Relation: Relation, HAS_ONE: HAS_ONE, HAS_MANY: HAS_MANY };
})();
