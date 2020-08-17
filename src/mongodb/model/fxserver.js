const DatabaseModel = require('./index.js');

class ModelFXServer extends DatabaseModel {
    _normalizeV1() {
        const {address, api_key} = this.getDocument();

        if (!address || !address.ip || !address.port) {
            throw new Error('Missing Address');
        }

        if (!api_key) {
            throw new Error('Missing API Key');
        }

        this.address = address;
        this.api_key = api_key;
    }

    getAddress() {
        return this.address;
    }

    getAPIKey() {
        return this.api_key;
    }
}

module.exports = ModelFXServer;