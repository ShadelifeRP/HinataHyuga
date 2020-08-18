const DiscordCommand = require('./index.js');
const ModelFXServer = require('../../mongodb/model/fxserver.js');
const {MessageEmbed} = require('discord.js');

class CommandFXServerInfo extends DiscordCommand {
    constructor(hinata) {
        super(hinata, {
            name: 'FXServer Info',
            cmd: 'fxserver_inf',
            aliases: ['fxi'],
            args: ['?id:string:FXServer  or Guild ID'],
            description: "Provides info about a FX Server"
        });
    }

    async execute({
                      guild,
                      message,
                      user,
                      member,
                      fxserver
                  }, args) {
        let server;
        for (const s of Object.values(this.getHinata().getIntegrationFXServer().getServers())) {
            if (server) {
                continue;
            }

            if (s.getID() === args.id) {
                server = s;
            }

            if (guild && guild.id === s.getGuildID()) {
                server = s;
            }
        }

        if (!server) {
            return message.channel.send(new MessageEmbed()
                .setTimestamp()
                .setColor(0xFF0000)
                .setTitle('Unknown Server')
                .setDescription(`Unknown Server: ${args.id}`)
            ).then(m => {
                this.getIntegrationDiscord().addMessageToAutoDeletionPool(m);
                this.getIntegrationDiscord().addMessageToAutoDeletionPool(message);
            })
        }

        const fxserver_document = Object.assign({}, server.getDocument());
        delete fxserver_document.api_key;

        this.getIntegrationDiscord().addMessageToAutoDeletionPool(message, 1);

        return message.channel.send(new MessageEmbed()
            .setTimestamp()
            .setColor(0x00FF00)
            .setTitle('FXServer Info')
            .setDescription([
                "```json",
                JSON.stringify(fxserver_document, null, 2),
                "```",
            ].join('\n'))
            .setURL(ModelFXServer.getServerInfoURL(fxserver_document.address.host, fxserver_document.address.port || 30120))
        );
    }
}

module.exports = CommandFXServerInfo;