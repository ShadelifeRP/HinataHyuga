const HinataError = require('./error.js');
const DiscordMissingCommandArgumentError = require('./discord/missing_arg.js');
const DiscordInvalidCommandArgumentError = require('./discord/invalid_arg.js');

module.exports = {
    Hinata: HinataError,
    DiscordMissingCommandArgumentError,
    DiscordInvalidCommandArgumentError
};