const {Hinata: HinataError} = require('../../utilities/errors/index.js');

const getDiscordUser = {
    method: 'get',
    path: '/users/:discord_id/:steam_id',
    handler: async (request, response, next) => {
        const fxserver = await request.requiresFXServerAuthentication();

        if (fxserver instanceof Error) {
            return next(fxserver);
        }

        try {
            const player_data = await Promise.all([
                request.getHinata().getIntegrationSteam().getPlayerInfo(BigInt('0x' + request.params.steam_id).toString('10')).then(player_data => ({steam: player_data})),
                request.getHinata().getIntegrationDiscord().getPlayerData(fxserver.getGuildID(), request.params.discord_id).then(player_data => ({discord: player_data}))
            ]).then(results => Object.assign({}, ...results));

            const relevant_roles = player_data.discord.roles
                .filter((role_id) => {
                    return fxserver.roles[role_id] !== undefined;
                });
            const priorities = relevant_roles.map(role_id => {
                return fxserver.roles[role_id].priority;
            }).sort();
            const is_whitelisted = relevant_roles.map(role_id => {
                return fxserver.roles[role_id].whitelisted

            }).length > 0;
            const privileges = relevant_roles.reduce((previous, role_id) => {
                if (fxserver.roles[role_id] && fxserver.roles[role_id].privileges) {
                    previous.push(...fxserver.roles[role_id].privileges);
                }

                return previous;
            }, []);

            return response.json({
                avatar: player_data.discord.avatar,
                roles: relevant_roles,
                priority: priorities.length > 0 ? priorities[0] : 0,
                name: player_data.discord.name,
                is_clean: player_data.steam.is_clean,
                whitelisted: is_whitelisted,
                privileges
            });
        } catch (e) {
            if (e instanceof HinataError) {
                return response.json(e);
            }

            return next(e);
        }
    }
};

//Deprecated
const verifyUser = {
    method: 'get',
    path: '/users/:discord_id/:steam_id/verify',
    handler: async (request, response, next) => {
        const fxserver = await request.requiresFXServerAuthentication();

        if (fxserver instanceof Error) {
            return next(fxserver);
        }

        try {
            const player_data = await Promise.all([
                request.getHinata().getIntegrationSteam().getPlayerInfo(BigInt('0x' + request.params.steam_id).toString('10')).then(player_data => ({steam: player_data})),
                request.getHinata().getIntegrationDiscord().getPlayerData(fxserver.getGuildID(), request.params.discord_id).then(player_data => ({discord: player_data}))
            ]).then(results => Object.assign({}, ...results));

            if (!player_data.steam.is_clean) {
                return response.json(new HinataError(401, "Your Steam Record doesn't satisfy this server's requirements."));
            }

            const relevant_roles = player_data.discord.roles
                .filter((role_id) => {
                    return fxserver.roles[role_id] !== undefined;
                });
            const priorities = relevant_roles.map(role_id => {
                return fxserver.roles[role_id].priority;
            }).sort();
            const is_whitelisted = relevant_roles.map(role_id => {
                return fxserver.roles[role_id].whitelisted
            }).length > 0;

            if (!is_whitelisted) {
                return response.json(new HinataError(401, "You're not whitelisted..."));
            }

            return response.json({
                avatar: player_data.discord.avatar,
                roles: relevant_roles,
                priority: priorities.length > 0 ? priorities[0] : 1,
                name: player_data.discord.displayName
            });
        } catch (e) {
            return response.json(e);
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
    polka.add(verifyUser.method.toUpperCase(), verifyUser.path, verifyUser.handler);
};

module.exports = {
    getDiscordUser,
    postLog,
    add
};