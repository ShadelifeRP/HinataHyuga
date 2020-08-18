const DiscordCommand = require('./index.js');
const ModelFXServer = require('../../mongodb/model/fxserver.js');
const {MessageEmbed} = require('discord.js');

class CommandProvisionFXServer extends DiscordCommand {
    constructor(hinata) {
        super(hinata, {
            name: 'Provision FXServer',
            cmd: 'provision_fxserver',
            aliases: ['pfx'],
            args: ['host:string:Server Hostname', '?port:port:Server Port (1024-65535)'],
            description: "Provisions a new FXServer"
        });
    }

    async execute({
                      guild,
                      message,
                      user,
                      member,
                      fxserver
                  }, args) {
        try {
            const server_info = await ModelFXServer.getServerInfo(args.host, args.port);
            const model_fxserver = await this.getHinata().getIntegrationMongoDB().provisionFXServer({
                address: {
                    host: args.host,
                    port: args.port || 30120
                },
                guild: guild.id
            });

            return message.channel.send(new MessageEmbed()
                .setTimestamp()
                .setColor(0x00FF00)
                .setTitle('FXServer Created')
                .setDescription([
                    `**ID**: ${model_fxserver.getID()}`,
                    `**API Key**: ${model_fxserver.getAPIKey()}`,
                ].join('\n'))
                .setURL(ModelFXServer.getServerInfoURL(args.host, args.port))
            ).then(m => {
                this.getIntegrationDiscord().addMessageToAutoDeletionPool(m, 8);
            })
        } catch (e) {
            return message.channel.send(new MessageEmbed()
                .setTimestamp()
                .setColor(0xFF0000)
                .setTitle('FXServer Unreachable')
                .setDescription(e.message)
                .setURL(ModelFXServer.getServerInfoURL(args.host, args.port))
            ).then(m => {
                this.getIntegrationDiscord().addMessageToAutoDeletionPool(m);
            })
        }
    }
}

module.exports = CommandProvisionFXServer;