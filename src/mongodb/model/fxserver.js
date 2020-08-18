const DatabaseModel = require('./index.js');
const {MessageEmbed} = require('discord.js');
const {v5: {generate: generateV5UUID}, v4: {generate: generateV4UUID}} = require('codingseaotter-uuid');
const {API_KEY_NAMESPACE} = require('../../utilities/constants.js');
const {updateAPIKey} = require('../functions/fxserver.js');

class ModelFXServer extends DatabaseModel {
    _normalizeV1() {
        const {address, api_key, guild, loggables, roles} = this.getDocument();

        if (!address || !address.ip || !address.port) {
            throw new Error('Missing Address');
        }

        if (!api_key) {
            throw new Error('Missing API Key');
        }

        this.roles = roles || {};
        this.loggables = loggables;
        this.guild = guild;
        this.address = address;
        this.api_key = api_key;
    }

    throwError(message, code) {
        const error = new Error(message);
        error.code = code;

        throw error;
    }

    async postLogMessage(loggable, content) {
        if (!this.loggables || !this.getLoggable(loggable)) {
            this.throwError(`Loggable ${loggable} is not supported`, 400);
        }

        loggable = this.getLoggable(loggable);

        if (typeof content === 'string') {
            content = {
                message: content
            };
        }

        if (!content || !content.message) {
            this.throwError('Missing Message', 400)
        }

        const discord_guild = await this.getGuild()
        const discord_channel = discord_guild.channels.cache.get(loggable.channel_id);

        if (!discord_channel) {
            this.throwError('Not Supported', 409)
        }

        const embed = new MessageEmbed()
            .setTimestamp()
            .setDescription(content.message)
            .setColor(content.colour || loggable.colour || '#00AEFF')

        if (content.title || loggable.title) {
            embed.setTitle(content.title || loggable.title);
        }

        if (content.fields && !Array.isArray(content.fields)) {
            content.fields = [content.fields];
        }

        if (Array.isArray(content.fields)) {
            content.fields.forEach(([name, value]) => {
                embed.addField(name, value);
            });
        }

        if (content.footer || loggable.footer) {
            embed.setFooter(content.footer.text || loggable.footer.text, content.footer.icon_url || loggable.footer.icon_url);
        }

        return discord_channel.send(embed)

    }

    async getPlayerProfile(discord_id, steam_id) {
        if (typeof discord_id !== 'string' || typeof steam_id !== 'string') {
            this.throwError('Invalid Discord/Steam ID', 400);
        }

        const discord_guild = await this.getGuild();
        const discord_user = await discord_guild.members.fetch(discord_id);

        if (!discord_user) {
            this.throwError('Invalid User', 404);
        }

        const user_roles = discord_user.roles.cache.keyArray();
        const relevant_roles = user_roles
            .filter((role_id) => {
                return this.roles[role_id] !== undefined;
            });
        const priorities = relevant_roles.map(role_id => {
            return this.roles[role_id].priority;
        }).sort();
        const is_whitelisted = relevant_roles.map(role_id => {
            return this.roles[role_id].whitelisted
        }).length > 0;

        return {
            id: discord_user.id,
            priority: priorities.length > 0 ? priorities[0] : 1,
            is_whitelisted,
            allow_join: true,
            name: discord_user.displayName,
            avatar: discord_user.user.displayAvatarURL({format: 'png'})
        };
    }

    async refreshAPIKey() {
        const api_key = ModelFXServer.createAPIKey();

        if (!(await updateAPIKey({database: this.getHinata().getIntegrationMongoDB().getDatabase()}, this.getID(), api_key))) {
            return false;
        }

        this.api_key = api_key;

        return true;
    }

    static createAPIKey() {
        return generateV5UUID(generateV4UUID(), API_KEY_NAMESPACE);
    }

    getGuildID() {
        return this.guild;
    }

    async getGuild() {
        if (this._discord_guild) {
            return this._discord_guild;
        }

        if (!this.getGuildID()) {
            this.throwError('Not Supported', 409)
        }

        this._discord_guild = await this.getHinata().getIntegrationDiscord().getClient().guilds.fetch(this.getGuildID());

        if (!this._discord_guild) {
            this.throwError('Not Supported', 409)
        }

        return this._discord_guild;
    }

    getLoggable(loggable) {
        return this.loggables[loggable];
    }

    getAddress() {
        return this.address;
    }

    getAPIKey() {
        return this.api_key;
    }
}

module.exports = ModelFXServer;