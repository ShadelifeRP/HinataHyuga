const {Client: DiscordClient, MessageEmbed} = require('discord.js');
const BaseIntegration = require('../utilities/baseintegration.js');
const {DiscordMissingCommandArgumentError, DiscordInvalidCommandArgumentError} = require('../utilities/errors/index.js');
const CommandProvisionFXServer = require('./commands/provisionfxserver.js');
const CommandFXServerInfo = require('./commands/fxserverinfo.js');
const CommandHelp = require('./commands/help.js');
const CommandSteamPlayerLookup = require('./commands/steam_lookup.js');

class IntegrationDiscord extends BaseIntegration {
    constructor(...args) {
        super('Discord', ...args);

        this.client = new DiscordClient();
        this.commands = [
            new CommandProvisionFXServer(this.getHinata()),
            new CommandFXServerInfo(this.getHinata()),
            new CommandHelp(this.getHinata()),
            new CommandSteamPlayerLookup(this.getHinata()),
        ];
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

    async onEventMessage(message) {
        if (!message || !message.author || message.author.bot) {
            return;
        }

        let content = message.content.trim();

        if (!this.isCommand(content)) {
            return;
        }

        const raw_command = this.stripCommandPrefix(content);
        const command_parts = raw_command.split(' ');
        const command_name = command_parts[0];
        let args = command_parts.length > 0 ? command_parts.slice(1) : [];
        const command = this.findCommand(command_name);

        if (!command) {
            return message.channel.send(`Unknown Command '${command_name}'`).then(m => {
                this.addMessageToAutoDeletionPool(m, 6);
                this.addMessageToAutoDeletionPool(message, 6);
            });
        }

        try {
            args = command.processArgs(args);

            await command.execute({
                message,
                user: message.author,
                guild: message.guild,
                member: message.member,
                fxserver: this.getHinata().getIntegrationFXServer().getServerByDiscordID(message.guild ? message.guild.id : undefined)
            }, args);
        } catch (e) {
            this.addMessageToAutoDeletionPool(message, 6);
            if (e instanceof DiscordMissingCommandArgumentError || e instanceof DiscordInvalidCommandArgumentError) {
                const embed = new MessageEmbed()
                    .setTitle(`Invalid Usage: ${command.getName()}`)
                    .setDescription([
                        e.message,
                        '',
                        `**Description:** _${command.getDescription()}_`,
                        `**Usage:** ${command.getUsage()}`
                    ].join('\n'))
                    .setColor(0xFF0000)
                    .setFooter(message.member ? message.member.displayName : message.author.username, message.author.displayAvatarURL())
                    .setTimestamp();

                return message.channel.send(embed).then(m => {
                    this.addMessageToAutoDeletionPool(m, 12);
                });
            } else {
                this.getLogger().warning(e);
            }
        }
    }

    addMessageToAutoDeletionPool(message, time = 10) {
        setTimeout(() => {
            try {
                message.delete().catch(e => {
                    this.getLogger().warning(e);
                });
            } catch (e) {
                this.getLogger().warning(e);
            }
        }, time * 1000);
    }

    isCommand(text) {
        return text.startsWith(this.getOption('cmd_prefix')) || text.startsWith(`<@!${this.getClient().user.id}>`) || text.startsWith(`<@${this.getClient().user.id}>`);
    }

    stripCommandPrefix(content) {
        return content.startsWith(this.getOption('cmd_prefix')) ? content.slice(this.getOption('cmd_prefix').length) : content.split(' ').slice(1).join(' ');
    }

    findCommand(cmd_name) {
        return this.getCommands().filter(cmd => cmd.match(cmd_name))[0];
    }

    getCommands() {
        return this.commands;
    }

    getClient() {
        return this.client;
    }
}

module.exports = IntegrationDiscord;