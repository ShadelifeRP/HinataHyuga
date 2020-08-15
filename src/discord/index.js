const {Client: DiscordClient} = require('discord.js');
const BaseIntegration = require('../utilities/baseintegration.js')

class DiscordIntegration extends BaseIntegration {
    constructor(...args) {
        super('Discord', ...args);

        this.client = new DiscordClient();
    }


}

module.exports = DiscordIntegration;