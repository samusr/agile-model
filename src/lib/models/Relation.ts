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
					return "BELONGS_TO_ONE";
				case "MANY_TO_MANY":
					return "MANY_TO_MANY";
				default:
					throw new Error(`Unsupported relation type [${this.type}]`);
			}
		}
	}

	class Relation {
		// @ts-ignore: Cannot find Model
		sourceModel: Model;
		// @ts-ignore: Cannot find Model
		dependentModels: Array<Model>;
		relationType: RelationType;

		// @ts-ignore: Cannot find Model
		constructor(sourceModel: Model, dependentModel: Model, relationType: RelationType) {
			this.sourceModel = sourceModel;
			this.relationType = relationType;
			this.dependentModels = dependentModel ? [dependentModel] : [];
		}

		// @ts-ignore: Cannot find Model
		addDependentModel(dependentModel: Model): void {
			for (let m of this.dependentModels) {
				if (m == dependentModel) return;
			}

			this.dependentModels.push(dependentModel);
		}

		toString(): string {
			return `Source: ${this.sourceModel.modelName}\nType: ${this.relationType.type}\nDependents: [${this.dependentModels.reduce(
				(acc, model) => `${acc} ${model.modelName},`,
				""
			)}]\n`;
		}
	}

	const HAS_ONE = new RelationType("HAS_ONE");
	const HAS_MANY = new RelationType("HAS_MANY");

	return { Relation, HAS_ONE, HAS_MANY };
})();
