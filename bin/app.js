const {Logger, LEVELS: LOG_LEVELS} = require('../src/utilities/logger.js')
const HinataHyuga = require('../src/index.js');
const PackageJSON = require('../package.json');
const AppLogger = new Logger();
const BootstrapLogger = AppLogger.createNewLogger('Boostrapper')

BootstrapLogger.info({
    message: 'Boostrapping %s v%s by %s',
    message_data: [PackageJSON.name, PackageJSON.version, PackageJSON.author]
})

//
// BASE CONSTANTS
//

const ENVIRONMENT_PREFIX = 'HINATAHYUGA';
const ENVIRONMENT_SEPARATOR = '__';

/**
 *
 * This function takes your object of variables (Usually provided by process.env) and filters out any entries
 * that doesn't start with the defined prefix and separator joined.
 *
 * @param environment_variables your object of variables to filter, usually from process.env
 * @returns {{}} the input filtered
 */
const filterEnvironmentVariables = (environment_variables) => {
    const prefix = [ENVIRONMENT_PREFIX, ENVIRONMENT_SEPARATOR].join('');

    return Object.entries(environment_variables)
        .filter(([key]) => key.toUpperCase().startsWith(prefix))
        .reduce((previous, [key, value]) => {
            previous[key] = value;

            return previous;
        }, {});
};

/**
 *
 * This cleans up the variables (that should've been filtered) by removing the prefix
 *
 * @param environment_variables
 * @returns {{}}
 */
const removedPrefixFromEnvironmentVariables = (environment_variables) => {
    const prefix = [ENVIRONMENT_PREFIX, ENVIRONMENT_SEPARATOR].join('');

    return Object.entries(environment_variables)
        .reduce((previous, [key, value]) => {
            previous[key.startsWith(prefix) ? key.slice(prefix.length) : key] = value;

            return previous;
        }, {});
};

/**
 *
 * This splits the path using ENVIRONMENT_SEPARATOR
 *
 * @param path
 * @returns {*|string[]}
 */
const splitEnvironmentPath = (path) => {
    return path.split(ENVIRONMENT_SEPARATOR);
};

/**
 *
 * This will build an options object from the provided set of variables.
 * The variables should ideally be filtered and cleaned prior to running this.
 *
 * @param filtered_environment_variables
 * @returns {{}}
 */
const buildOptionsObject = (filtered_environment_variables) => {
    return Object.entries(filtered_environment_variables).reduce((previous, [key, value]) => {
        const key_parts = splitEnvironmentPath(key);
        const first_key = key_parts[0].toLowerCase();

        if (key_parts.length === 1) {
            previous[first_key] = value;

            return previous;
        }

        previous[first_key] = fillObject(key_parts.slice(1), value, previous[first_key] || {});

        return previous;
    }, {});
};

/**
 *
 * This fills the object with the value using the keys as the path to aid in building the options object
 *
 * @param keys
 * @param value
 * @param obj
 * @returns {*}
 */
const fillObject = (keys, value, obj) => {
    const first_key = keys[0].toLowerCase();

    if (keys.length === 1) {
        obj[first_key] = value;

        return obj;
    }

    obj[first_key] = fillObject(keys.slice(1), value, obj[first_key] || {});

    return obj;
};

const filtered = filterEnvironmentVariables(process.env);

BootstrapLogger.info({
    message: 'Found %d environmental %s',
    message_data: [Object.keys(filtered).length, Object.keys(filtered).length === 1 ? 'option' : 'options']
})

const no_prefix = removedPrefixFromEnvironmentVariables(filtered);
const options = buildOptionsObject(no_prefix);
const app = new HinataHyuga(options, AppLogger);

app.run()
    .then(() => {
        BootstrapLogger.info({
            message: 'Successfully bootstrapped'
        })
    })
    .catch(e => {
        BootstrapLogger.fatal(e)

        process.exit(1);
    });