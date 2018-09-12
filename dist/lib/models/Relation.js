module.exports = (function () {
    var RelationType = /** @class */ (function () {
        function RelationType(type) {
            this.type = type;
        }
        RelationType.prototype.getReverse = function () {
            switch (this.type) {
                case "HAS_ONE":
                case "HAS_MANY":
                    return new RelationType("BELONGS_TO_ONE");
                case "BELONGS_TO_ONE":
                    return new RelationType("HAS_MANY");
                default:
                    throw "Unsupported relation type [" + this.type + "]";
            }
        };
        return RelationType;
    }());
    var Relation = /** @class */ (function () {
        // @ts-ignore: Cannot find Model
        function Relation(sourceModel, dependencyModel, relationType) {
            this.sourceModel = sourceModel;
            this.relationType = relationType;
            this.dependencyModels = dependencyModel ? [dependencyModel] : [];
        }
        // @ts-ignore: Cannot find Model
        Relation.prototype.adddependencyModel = function (dependencyModel) {
            for (var _i = 0, _a = this.dependencyModels; _i < _a.length; _i++) {
                var m = _a[_i];
                if (m == dependencyModel)
                    return;
            }
            this.dependencyModels.push(dependencyModel);
        };
        Relation.prototype.toString = function () {
            var sourceModelName = this.sourceModel.modelName;
            var relationTypeName = this.relationType.type;
            var dependencyModelNames = this.dependencyModels.reduce(function (acc, model) { return acc + " " + model.modelName + ","; }, "");
            dependencyModelNames = dependencyModelNames.trim();
            dependencyModelNames = dependencyModelNames.substring(0, dependencyModelNames.length - 1);
            return "Source: " + sourceModelName + "\nType: " + relationTypeName + "\nDependencies: [ " + dependencyModelNames + " ]\n";
        };
        return Relation;
    }());
    var HAS_ONE = new RelationType("HAS_ONE");
    var HAS_MANY = new RelationType("HAS_MANY");
    var BELONGS_TO_ONE = new RelationType("BELONGS_TO_ONE");
    return { Relation: Relation, HAS_ONE: HAS_ONE, HAS_MANY: HAS_MANY, BELONGS_TO_ONE: BELONGS_TO_ONE };
})();
