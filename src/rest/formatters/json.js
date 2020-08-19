const format = (data) => {
    return JSON.stringify(data, null, 2);
};

const setup = (hinata, options = {}) => {
    return (request, response, next) => {
        response.json = (data, code) => {
            code = code || (data instanceof Error ? data.code ? data.code : 500 : 200);

            if (data instanceof Error) {
                data = {
                    message: data.message,
                    name: data.name,
                    stack_trace: hinata.getOption('mode', 'production') === 'development' ? data.stack : undefined
                };
            }

            if (Buffer.isBuffer(data)) {
                data = data.toString('base64');
            }

            try {
                data = format(data);
            } catch (e) {
                return hinata.getIntegrationREST().handleError(e, request, response);
            }

            response.statusCode = code;
            response.setHeader('Content-Type', 'application/json');
            response.setHeader('Content-Length', Buffer.byteLength(data));

            response.end(data);
        };

        return next();
    };
};

module.exports = {
    format,
    setup
};