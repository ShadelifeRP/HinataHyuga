const DiscordCommand = require('./index.js');

class CommandProvisionFXServer extends DiscordCommand {
    constructor(hinata) {
        super(hinata, {
            name: 'Provision FXServer',
            cmd: 'provision_fxserver',
            aliases: ['pfx'],
            args: ['host:string:Server Hostname', 'port:port:Server Port (1024-65535)'],
            description: "Provisions a new FXServer"
        });
    }
}

module.exports = CommandProvisionFXServer;