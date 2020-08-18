const {DiscordMissingCommandArgumentError, DiscordInvalidCommandArgumentError} = require('../../utilities/errors/index.js');
const {capitalize} = require('../../utilities/index.js');

class DiscordCommand {
    constructor(hinata, {
        cmd,
        name,
        aliases = [],
        args = [],
        description = null
    } = {}) {
        this.hinata = hinata;
        this.cmd = cmd;
        this.name = capitalize(name || cmd);
        this.aliases = aliases;
        this.description = description;
        this.args = this.mapArgSpecifications(args);
    }

    async execute({
                      guild,
                      message,
                      user,
                      member,
                      fxserver
                  }, args) {
        throw new Error('Not Implemented');
    }

    match(to_match) {
        to_match = to_match.toLowerCase();

        return this.getCMD() === to_match || this.getAliases().filter(alias => alias.toLowerCase() === to_match).length > 0;
    }

    processArgs(args) {
        if (args.length === 0 && this.getArgSpecifications().length === 0) {
            return {};
        }

        const processed_args = {};

        for (let index = 0; index < this.getArgSpecifications().length; index++) {
            const arg_specification = this.getArgSpecifications()[index];

            if (!args[index]) {
                if (!arg_specification.optional) {
                    throw new DiscordMissingCommandArgumentError(arg_specification);
                }

                return processed_args;
            }

            processed_args[arg_specification.name] = this.processArg(args[index], arg_specification);
        }

        if(this.getArgSpecifications().length < args.length) {
            processed_args._ =  args.slice(this.getArgSpecifications().length).join(" ");
        }

        return processed_args;
    }

    processArg(input, arg_specification) {
        switch (arg_specification.type) {
            case 'number':
                return this._convertToNumber(input, arg_specification);
            case 'port':
                return this._convertToPort(input, arg_specification);
            case 'discord_command':
                return this._convertToDiscordCommand(input, arg_specification);
            default:
                return input;
        }
    }

    _convertToPort(input, arg_specification) {
        const number = this._convertToNumber(input, arg_specification);

        if (number < 1024 || number > 65535) {
            throw new DiscordInvalidCommandArgumentError(arg_specification, 'not between 1024-65535 (inclusive)2');
        }

        return number;
    }

    _convertToNumber(input, arg_specification) {
        if (isNaN(parseFloat(input))) {
            throw new DiscordInvalidCommandArgumentError(arg_specification, 'not a valid number');
        }

        return parseFloat(input);
    }

    _convertToDiscordCommand(input, arg_specification) {
        const command = this.getHinata().getIntegrationDiscord().findCommand(input);

        if (!command) {
            throw new DiscordInvalidCommandArgumentError(arg_specification, 'not a registered command');
        }

        return command;
    }

    mapArgSpecifications(arg_specifications) {
        return arg_specifications.map(arg => {
            if (!arg.includes(':')) {
                arg = [arg, 'string'].join(':');
            }

            const optional = arg.startsWith('?');
            const [name, type, ...description_parts] = (optional ? arg.slice(1) : arg).split(':');
            const processed_specification = {
                optional,
                name,
                type,
            };

            if (description_parts.length > 0) {
                processed_specification.description = description_parts.join(':')
            }

            return processed_specification;
        });
    }

    getHinata() {
        return this.hinata;
    }

    getCMD() {
        return this.cmd;
    }

    getName() {
        return this.name;
    }

    getAliases() {
        return this.aliases;
    }

    getArgSpecifications() {
        return this.args;
    }

    getDescription() {
        return this.description;
    }

    getUsage() {
        return [
            `<@!${this.getHinata().getIntegrationDiscord().getClient().user.id}>`,
            this.getCMD(),
            ...this.getArgSpecifications().map(arg => {
                const arg_content = (arg.description ? [arg.name, arg.description] : [arg.name]).join(', ');

                return arg.optional ? `[${arg_content}]` : `<${arg_content}>`
            })
        ].filter(element => !!element).join(' ');
    }
}


module.exports = DiscordCommand;