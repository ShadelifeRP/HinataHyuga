const BaseIntegration = require('../utilities/baseintegration.js');

class IntegrationFXServer extends BaseIntegration {
    constructor(...args) {
        super('FXServer', ...args);

        this.servers = {};
    }

    async run() {
        this.servers = await this.getHinata().getIntegrationMongoDB().findAllFXServers();
    }

    getServers() {
        return this.servers;
    }

    getServer(_id) {
        return this.servers[_id];
    }

    getServerByDiscordID(guild_id) {
        for (const server of Object.values(this.getServers())) {
            if (server.getGuildID() === guild_id) {
                return server;
            }
        }

        return undefined;
    }
}

module.exports = IntegrationFXServer;