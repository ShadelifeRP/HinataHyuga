const {mergeDeep} = require('./utilities/index.js');
const DEFAULT_OPTIONS = {};

class HinataHyuga {
    constructor(options = {}, logger) {
        this.options = mergeDeep(DEFAULT_OPTIONS, options);
        this.logger = logger;
    }

    async run() {

    }

    getOptions() {
        return this.options;
    }

    getOption(key) {
        return key.split('=>').reduce((obj = {}, index) => obj[index], this.getOptions());
    }
}

module.exports = HinataHyuga;