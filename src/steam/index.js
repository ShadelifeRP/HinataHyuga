const BaseIntegration = require('../utilities/baseintegration.js');
const SteamAPI = require('steamapi');

class IntegrationSteam extends BaseIntegration {
    constructor(...args) {
        super('Steam', ...args);

        this.steam_api = new SteamAPI(this.getOption('token'));
    }

    async run() {

    }

    async resolveSteamID(input) {
        try {
            return BigInt(input).toString(10);
        } catch (e) {
        }
        try {
            return BigInt(`0x${input}`).toString(10);
        } catch (e) {
        }

        try {
            if (!input.startsWith('http')) {
                input = `https://steamcommunity.com/id/${input}`;
            }

            return await this.getSteamAPI().resolve(input);
        } catch (e) {
        }

        return undefined;
    }

    async getPlayerInfo(id) {
        const promises = [
            this.getSteamAPI().getUserBans(id).then(result => ({
                economy: result.economyBan,
                community: result.communityBanned,
                vac_banned: result.vacBanned,
                days_since_last_ban: result.daysSinceLastBan,
                game_bans: result.gameBans,
                vac_bans: result.vacBans,
                is_clean: !result.vacBanned && result.economyBan === 'none' && result.vacBans === 0 && result.gameBans === 0 && !result.communityBanned
            })),
            this.getSteamAPI().getUserSummary(id).then(result => ({
                url: result.url,
                created: new Date(result.created),
                nickname: result.nickname,
                real_name: result.realName,
                avatar: result.avatar.large || result.avatar.medium || result.avatar.small
            })),
        ];

        return Promise.all(promises).then(results => Object.assign({id}, ...results));
    }

    getSteamAPI() {
        return this.steam_api;
    }
}

module.exports = IntegrationSteam;