const util = require('util');
const moment = require('moment');
const LEVELS = {
    FATAL: 0,
    ERROR: 10,
    WARNING: 20,
    INFO: 30,
    DEBUG: 40
};
const TIMESTAMP_FORMAT = 'h:mm:ssa/MMMM Do';

class Logger {
    constructor({level = LEVELS.INFO, components = [], parent, levels = LEVELS, timestamp_format = TIMESTAMP_FORMAT} = {}) {
        this.components = Array.isArray(components) ? components : [components];
        this.parent = parent;

        if (this.getParent()) {
            this.levels = this.getParent().getLevels();
            this.level = this.getParent().getLevel();
            this.timestamp_format = this.getParent().getTimestampFormat();
        } else {
            this.levels = levels;
            this.level = typeof level === "string" ? this.getLevelFromString(level) : level;
            this.timestamp_format = timestamp_format;
        }
    }

    log(level, options) {
        if (options instanceof Error) {
            this.log(level, {
                message: `[%s] ${options.message}`,
                message_data: [options.name || 'Unknown']
            });

            let count = 0;

            for (const stack_line of options.stack.split('\n')) {
                if (stack_line === `${options.name}: ${options.message}`) {
                    continue;
                }

                this.log(level, {
                    message: `\t[%d]: ${stack_line.trim()}`,
                    message_data: [++count]
                });
            }

            return;
        }

        if (typeof options === 'string') {
            options = {message: options, message_data: []}
        }

        let {
            message,
            components,
            message_data = [],
            extra
        } = options;

        if (this.getParent()) {
            return this.getParent().log(level, {
                message,
                message_data,
                extra,
                components: components ? this.getComponents().concat(components) : this.getComponents()
            })
        }

        if (typeof level === "string") {
            level = this.getLevelFromString(level)
        }

        if (level === undefined || level === null) {
            level = this.getLevel();
        }

        if (!this.isLogableLevel(level)) {
            return;
        }

        components = components ? this.getComponents().concat(components) : this.getComponents();

        if (components.length < 1) {
            components = undefined;
        }

        message = util.format(message, ...(message_data || [])) + ';';
        const timestamp = moment().format(this.getTimestampFormat());
        const entry = [
            `[${timestamp}]`,
            `[${this.prettifyLogLevel(level)}]`,
            components ? `[${components.join(' / ')}]` : undefined,
            message,
            JSON.stringify(extra, null, 0)
        ].filter(element => !!element).join(' ');

        if (level < LEVELS.WARNING) {
            return console.error(entry);
        }

        console.log(entry);
    }

    fatal(options) {
        return this.log(LEVELS.FATAL, options);
    }

    error(options) {
        return this.log(LEVELS.ERROR, options);
    }

    warning(options) {
        return this.log(LEVELS.WARNING, options);
    }

    info(options) {
        return this.log(LEVELS.INFO, options);
    }

    debug(options) {
        return this.log(LEVELS.DEBUG, options);
    }

    isLogableLevel(level) {
        return level <= this.getLevel();
    }

    getLevelFromString(level_str) {
        const results = Object.entries(this.getLevels())
            .map(([name, value]) => [name.toLowerCase(), value])
            .filter(([name, value]) => name === level_str.toLowerCase())
            .map(([name, value]) => value);

        return results.length > 0 ? results[0] : undefined;
    }

    prettifyLogLevel(level) {
        const results = Object.entries(this.getLevels())
            .filter(([name, value]) => level === value)
            .map(([name, value]) => name);

        if (results.length > 0) {
            return results[0];
        }

        return 'UNKNOWN';
    };

    createNewLogger(components) {
        return new Logger({
            parent: this,
            components
        })
    }

    getComponents() {
        return this.components
    }

    getLevel() {
        return this.level;
    }

    setLevel(level) {
        if (typeof level === 'string') {
            level = this.getLevelFromString(level);
        }

        if (level === undefined || level === null) {
            return;
        }

        if (this.level === level) {
            return;
        }

        const old_level = this.getLevel();
        this.level = level;

        this.info({
            components: 'Logger',
            message: 'Max level have been updated %s:%s',
            message_data: [this.prettifyLogLevel(old_level), this.prettifyLogLevel(level)]
        });
    }

    getLevels() {
        return this.levels || LEVELS;
    }

    getTimestampFormat() {
        return this.timestamp_format;
    }

    getParent() {
        return this.parent;
    }
}

module.exports = {
    Logger,
    LEVELS
}