const BaseIntegration = require('../utilities/baseintegration.js');
const Polka = require('polka');
const BodyParser = require('body-parser');
const {STATUS_CODES} = require('http');
const {setup: JSONFormatter} = require('./formatters/json.js');
const MiddlewareFXServer = require('./middleware/fxserver.js');
const RoutesDiscord = require('./routes/discord.js');

class IntegrationREST extends BaseIntegration {
    constructor(...args) {
        super('REST', ...args);

        this.server = new Polka({});
        this.getServer().use(BodyParser.json({}));

        this.getServer().use((request, response, next) => {
            request.getHinata = () => {
                return this.getHinata();
            };

            return next();
        });
        this.getServer().use(JSONFormatter(this.getHinata(), this.getOptions()));
        this.getServer().use(MiddlewareFXServer.bind(this));
        this.getServer().onError = this.handleError.bind(this);
        this.getServer().onNoMatch = this.handleError.bind(this, {code: 404});
        RoutesDiscord.add(this.getServer());
    }

    async run() {
        await this.getServer().listen(this.getOption('address', {port: 40120, address: '127.0.0.1'}));
    }

    getServer() {
        return this.server;
    }

    handleError(error, request, response, next) {
        let code = (response.statusCode = error.code || error.status || 500);

        return response.json(error || STATUS_CODES[code], code);
    }
}

module.exports = IntegrationREST;