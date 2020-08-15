const {mergeDeep} = require('./utilities/index.js');
const DEFAULT_OPTIONS = {
    mongodb: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
};
const IntegrationDiscord = require('./discord/index.js');
const IntegrationMongoDB = require('./mongodb/index.js');

class HinataHyuga {
    constructor(options = {}, logger) {
        this.options = mergeDeep(DEFAULT_OPTIONS, options);
        this.logger = logger;
        this.integration_mongodb = new IntegrationMongoDB(this);
        this.integration_discord = new IntegrationDiscord(this);
    }

    async run() {
        await this.getIntegrationMongoDB().run();
        await this.getIntegrationDiscord().run();
    }

    getIntegrationMongoDB() {
        return this.integration_mongodb;
    }

    getIntegrationDiscord() {
        return this.integration_discord;
    }

    getOptions() {
        return this.options;
    }

    getOption(key, def) {
        return key.split('=>').reduce((obj = {}, index) => obj[index], this.getOptions()) || def;
    }

    getLogger() {
        return this.logger;
    }
}

module.exports = HinataHyuga;