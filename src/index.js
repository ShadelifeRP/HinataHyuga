const {mergeDeep} = require('./utilities/index.js');
const DEFAULT_OPTIONS = {
    mongodb: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    discord: {
        cmd_prefix: 'h$'
    }
};
const IntegrationDiscord = require('./discord/index.js');
const IntegrationMongoDB = require('./mongodb/index.js');
const IntegrationFXServer = require('./fxserver/index.js');
const IntegrationSteam = require('./steam/index.js');
const IntegrationREST = require('./rest/index.js');

class HinataHyuga {
    constructor(options = {}, logger) {
        this.options = mergeDeep(DEFAULT_OPTIONS, options);
        this.logger = logger;
        this.integration_mongodb = new IntegrationMongoDB(this);
        this.integration_discord = new IntegrationDiscord(this);
        this.integration_fxserver = new IntegrationFXServer(this);
        this.integration_steam = new IntegrationSteam(this);
        this.integration_rest = new IntegrationREST(this);
    }

    async run() {
        await this.getIntegrationMongoDB().run();
        await this.getIntegrationDiscord().run();
        await this.getIntegrationFXServer().run();
        await this.getIntegrationSteam().run();
        await this.getIntegrationREST().run();
    }

    getIntegrationMongoDB() {
        return this.integration_mongodb;
    }

    getIntegrationDiscord() {
        return this.integration_discord;
    }

    getIntegrationFXServer() {
        return this.integration_fxserver;
    }

    getIntegrationSteam() {
        return this.integration_steam;
    }

    getIntegrationREST() {
        return this.integration_rest;
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