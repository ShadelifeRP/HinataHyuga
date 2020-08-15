const {Client: DiscordClient} = require('discord.js');
const BaseIntegration = require('../utilities/baseintegration.js')

class IntegrationDiscord extends BaseIntegration {
    constructor(...args) {
        super('Discord', ...args);

        this.client = new DiscordClient();
        this.setupEvents();
    }

    setupEvents() {
        this.getClient().on('error', error => {
            this.getLogger().fatal(error);

            process.exit(1);
        });

        this.getClient().on('ready', () => {
            this.getLogger().info('Ready...');

            this.getClient().user.setPresence({
                game: 'Awaiting server ping...'
            });
        });
    }

    async run() {
        return this.getClient().login(this.getOption('token'));
    }

    getClient() {
        return this.client;
    }
}

module.exports = IntegrationDiscord;