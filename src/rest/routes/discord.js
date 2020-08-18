const getDiscordUser = {
    method: 'get',
    path: '/users/:discord_id/:steam_id',
    handler: async (request, response, next) => {
        const fxserver = await request.requiresFXServerAuthentication();

        if (fxserver instanceof Error) {
            return next(fxserver);
        }

        const {
            address,
            guild: guild_id
        } = fxserver;
        try {
            const discord = await fxserver.getPlayerProfile(request.params.discord_id, 'steam id');

            return response.json(discord);
        } catch(e) {
            return next(e);
        }
    }
};

const postLog = {
    method: 'put',
    path: '/logs/:loggable',
    handler: async (request, response, next) => {
        const fxserver = await request.requiresFXServerAuthentication();

        if (fxserver instanceof Error) {
            return next(fxserver);
        }

        const body = request.body || {};

        try {
            const r = await fxserver.postLogMessage(request.params.loggable, body);

            return response.json(r);
        } catch (e) {
            return next(e);
        }
    }
}

const add = (polka) => {
    polka.add(getDiscordUser.method.toUpperCase(), getDiscordUser.path, getDiscordUser.handler);
    polka.add(postLog.method.toUpperCase(), postLog.path, postLog.handler);
};

module.exports = {
    getDiscordUser,
    postLog,
    add
};