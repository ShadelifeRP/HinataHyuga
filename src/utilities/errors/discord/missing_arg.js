const HinataError = require('../error.js');

class DiscordMissingCommandArgumentError extends HinataError {
    constructor(arg) {
        super(`${arg.name} is required${arg.description ? ' (' + arg.description + ')' : ''}.`);

        this.arg = arg;
    }

    getArg() {
        return this.arg;
    }
}

module.exports = DiscordMissingCommandArgumentError;