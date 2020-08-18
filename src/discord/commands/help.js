const DiscordCommand = require('./index.js');
const {MessageEmbed} = require('discord.js');
const {capitalize} = require('../../utilities/index.js');

class CommandHelp extends DiscordCommand {
    constructor(hinata) {
        super(hinata, {
            cmd: 'help',
            aliases: ['h', '?'],
            args: ['?cmd:discord_command:Command Name/Alias'],
            description: "Displays Help"
        });
    }

    async execute(options, args) {
        return args.cmd ? this.executeCommandHelp(options, args.cmd) : this.executeGeneralHelp(options);
    }

    async executeGeneralHelp(options) {

    }

    async executeCommandHelp({message}, cmd) {
        const content = [
            cmd.getDescription(),
            '',
            `**Aliases:** ${cmd.getAliases().length > 0 ? cmd.getAliases().join(', ') : 'None...'}`,
            `**Usage: ** ${cmd.getUsage()}`
        ].join('\n');

        const embed = new MessageEmbed()
            .setColor(0x00AEFF)
            .setDescription(content)
            .setTimestamp()
            .setTitle(`Command Help For: ${capitalize(cmd.getName())}`);

        cmd.getArgSpecifications().forEach(arg => {
            const {
                name,
                description,
                type,
                optional
            } = arg;
            embed.addField((optional ? '?' : '') + capitalize(name), capitalize(description || type), true)
        });

        return message.channel.send(embed);
    }
}

module.exports = CommandHelp;