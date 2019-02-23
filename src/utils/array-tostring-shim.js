module.exports = (() => {
	Array.prototype.toString = function() {
		let str = "";

		for (let obj in this) if (this.hasOwnProperty(obj)) str += `${this[obj]}\n`;

		return str;
	};
})();
