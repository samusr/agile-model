module.exports = (function () {
    Array.prototype.toString = function () {
        var str = "";
        for (var obj in this)
            if (this.hasOwnProperty(obj))
                str += this[obj] + "\n";
        return str;
    };
})();
