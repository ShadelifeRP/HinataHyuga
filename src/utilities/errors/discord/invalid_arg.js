const HinataError = require('../error.js');

class DiscordInvalidCommandArgumentError extends HinataError {
    constructor(arg, reason) {
        super(`${arg.name} is invalid & needs to be a: ${arg.type}, is ${reason}`);

        this.arg = arg;
        this.reason = reason;
    }

    getArg() {
        return this.arg;
    }

    getReason() {
        return this.reason;
    }
}

module.exports = DiscordInvalidCommandArgumentError;