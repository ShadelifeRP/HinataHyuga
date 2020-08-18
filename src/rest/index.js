const BaseIntegration = require('../utilities/baseintegration.js');
const Polka = require('polka');
const {STATUS_CODES} = require('http');
const {setup: JSONFormatter} = require('./formatters/json.js');

class IntegrationREST extends BaseIntegration {
    constructor(...args) {
        super('REST', ...args);

        this.server = new Polka();
        this.getServer().use(JSONFormatter(this.getHinata(), this.getOptions()));
        this.getServer().onError = this.handleError.bind(this);
        this.getServer().onNoMatch = this.handleError.bind(this, {code: 404});
    }

    async run() {
        await this.getServer().listen(this.getOption('address', {port: 40120, address: '127.0.0.1'}));
    }

    getServer() {
        return this.server;
    }

    handleError(error, request, response, next) {
        let code = (response.statusCode = error.code || error.status || 500);

        return response.json(error || STATUS_CODES[code]);
    }
}

module.exports = IntegrationREST;