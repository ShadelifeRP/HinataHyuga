const {mergeDeep} = require('./utilities/index.js');
const DEFAULT_OPTIONS = {};

class HinataHyuga {
    constructor(options = {}, logger) {
        this.options = mergeDeep(DEFAULT_OPTIONS, options);
        this.logger = logger;
    }

    async run() {

    }
}

module.exports = HinataHyuga;