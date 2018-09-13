module.exports = (() => {
	class RelationType {
		type: string;

		constructor(type: string) {
			this.type = type;
		}

		getReverse() {
			switch (this.type) {
				case "HAS_ONE":
				case "HAS_MANY":
					return new RelationType("BELONGS_TO_ONE");
				case "BELONGS_TO_ONE":
					return new RelationType("HAS_MANY");
				default:
					throw `Unsupported relation type [${this.type}]`;
			}
		}
	}

	class Relation {
		// @ts-ignore: Cannot find Model
		sourceModel: Model;
		// @ts-ignore: Cannot find Model
		dependencyModels: Array<Model>;
		relationType: RelationType;

		// @ts-ignore: Cannot find Model
		constructor(sourceModel: Model, dependencyModel: Model, relationType: RelationType) {
			this.sourceModel = sourceModel;
			this.relationType = relationType;
			this.dependencyModels = dependencyModel ? [dependencyModel] : [];
		}

		// @ts-ignore: Cannot find Model
		addDependencyModel(dependencyModel: Model): void {
			for (let m of this.dependencyModels) {
				if (m == dependencyModel) return;
			}

			this.dependencyModels.push(dependencyModel);
		}

		toString(): string {
			const sourceModelName = this.sourceModel.modelName;
			const relationTypeName = this.relationType.type;
			let dependencyModelNames = this.dependencyModels.reduce((acc, model) => `${acc} ${model.modelName},`, "");
			dependencyModelNames = dependencyModelNames.trim();
			dependencyModelNames = dependencyModelNames.substring(0, dependencyModelNames.length - 1);

			return `Source: ${sourceModelName}\nType: ${relationTypeName}\nDependencies: [ ${dependencyModelNames} ]\n`;
		}
	}

	const HAS_ONE = new RelationType("HAS_ONE");
	const HAS_MANY = new RelationType("HAS_MANY");
	const BELONGS_TO_ONE = new RelationType("BELONGS_TO_ONE");

	return { Relation, HAS_ONE, HAS_MANY, BELONGS_TO_ONE };
})();
