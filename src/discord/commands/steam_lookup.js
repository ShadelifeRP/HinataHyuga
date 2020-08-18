const DiscordCommand = require('./index.js');
const {MessageEmbed} = require('discord.js');
const {capitalize} = require('../../utilities/index.js');

class CommandSteamPlayerLookup extends DiscordCommand {
    constructor(hinata) {
        super(hinata, {
            cmd: 'steam_player_lookup',
            name: 'Steam Player Lookup',
            aliases: ['spl', 'lookup'],
            args: ['player_id:string:User ID, Hex ID, Custom URL Username or Profile URL'],
            description: "Looks up a player's credibility on steam."
        });
    }

    async execute({message}, {player_id}) {
        const messages = [];
        messages.push(await message.channel.send(`Resolving Player: ${player_id}`));

        try {
            const id64 = await this.getHinata().getIntegrationSteam().resolveSteamID(player_id);

            messages.push(await message.channel.send(`Resolved to: ${id64}`));

            const player = await this.getHinata().getIntegrationSteam().getPlayerInfo(id64);
            const player_message = new MessageEmbed()
                .setColor(0x00AEFF)
                .setTitle("Player Profile")
                .setURL(player.url)
                .setAuthor(player.nickname || player.real_name, player.avatar)
                .setDescription('This player has an excellent standing with Steam.')
                .setFooter(BigInt(id64).toString(16))

            if (!player.is_clean) {
                player_message
                    .setColor(0xFF0000)
                    .setDescription([
                        `**Currently VAC Banned: ** ${player.vac_banned ? '**YES**' : 'No'}`,
                        `**Days Since Last VAC Ban: ** ${player.days_since_last_ban}`,
                        `**VAC Bans On Record: ** ${player.vac_bans}`,
                        `**Game Bans On Record: ** ${player.game_bans}`,
                        `**Community Banned: ** ${player.community}`,
                        `**Economy Banned: ** ${player.economy === 'none' ? 'No' : player.economy}`
                    ].join('\n'));
            }

            await message.channel.send(player_message);
        } catch (e) {
            messages.push(await message.channel.send(new MessageEmbed()
                .setColor(0xFF0000)
                .setTimestamp()
                .setTitle(`Failed To Lookup "${player_id}"`)
                .setDescription(e.message)
            ));
        }

        messages.forEach(m => {
            this.getIntegrationDiscord().addMessageToAutoDeletionPool(m, 12);
        });

    }
}

module.exports = CommandSteamPlayerLookup;