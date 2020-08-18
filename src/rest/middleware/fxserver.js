module.exports = (request, response, next) => {
    request.requiresFXServerAuthentication = async () => {
        const {
            hinata_fxserver_id,
            hinta_fxserver_key
        } = request.headers;

        if (!hinata_fxserver_id || !hinta_fxserver_key) {
            const error = new Error('Missing ID/Key');
            error.code = 401;

            return error;
        }

        const fxserver = request.getHinata().getIntegrationFXServer().getServer(hinata_fxserver_id);

        if (!fxserver || !fxserver.api_key === hinta_fxserver_key) {
            const error = new Error('Invalid ID/Key');
            error.code = 401;

            return error;
        }

        return fxserver;
    };

    next();
};