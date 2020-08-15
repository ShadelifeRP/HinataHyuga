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
                activity: {
                    name: 'For Server Ping...',
                    type: 'LISTENING'
                },
                status: "idle"
            }).catch(this.getLogger().warning.bind(this.getLogger()));
        });

        this.getClient().on('message', this.onEventMessage.bind(this));
    }

    async run() {
        return this.getClient().login(this.getOption('token'));
    }

    onEventMessage(message) {
        if (!message || !message.author || message.author.bot) {
            return;
        }

        let content = message.content.trim();

        if (!this.isCommand(content)) {
            return;
        }

        content = this.stripCommandPrefix(content);

        message.reply(content);
    }

    isCommand(text) {
        return text.startsWith(this.getOption('cmd_prefix')) || text.startsWith(`<@!${this.getClient().user.id}>`) || text.startsWith(`<@${this.getClient().user.id}>`);
    }

    stripCommandPrefix(content) {
        return content.startsWith(this.getOption('cmd_prefix')) ? content.slice(this.getOption('cmd_prefix').length) : content.split(' ').slice(1).join(' ');
    }

    getClient() {
        return this.client;
    }
}

module.exports = IntegrationDiscord;