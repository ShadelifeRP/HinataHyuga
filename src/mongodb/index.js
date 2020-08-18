const BaseIntegration = require('../utilities/baseintegration.js');
const {MongoClient} = require('mongodb');
const {FXServer: FunctionsFXServer} = require('./functions/index.js');
const ModelFXServer = require('./model/fxserver.js');

class IntegrationMongoDB extends BaseIntegration {
    constructor(...args) {
        super('MongoDB', ...args);
    }

    async run() {
        if (!this.getOption('url')) {
            throw new Error('Missing MongoDB URL');
        }

        const parsed_url = new URL(this.getOption('url'));
        this.getLogger().info({
            message: 'Connecting %s:%d%s',
            message_data: [parsed_url.hostname, parsed_url.port, parsed_url.path ? parsed_url.path : parsed_url.pathname]
        });

        const connection_options = Object.assign({}, this.getOptions());
        delete connection_options.url;

        this.client = await MongoClient.connect(this.getOption('url'), connection_options);
        this.database = this.getClient().db();
        this.getLogger().info('Connected');
    }

    async provisionFXServer({address, guild_id}) {
        const document = await FunctionsFXServer.provisionFXServer({database: this.getDatabase()}, {
            address,
            guild_id,
            api_key: ModelFXServer.createAPIKey()
        });

        console.log(document);

        return new ModelFXServer(document, this.getHinata());
    }

    async findAllFXServers() {
        const documents = await FunctionsFXServer.findAll({database: this});

        return documents.reduce((prev, next) => {
            try {
                prev[next._id] = new ModelFXServer(next, this.getHinata());
            } catch (e) {
                this.getLogger().warning(`Ignoring FXServer ${next._id}: [${e.message}]`);
            }

            return prev;
        }, {});
    }

    getClient() {
        return this.client;
    }

    getDatabase() {
        return this.database;
    }
}

module.exports = IntegrationMongoDB;