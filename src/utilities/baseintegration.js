class BaseIntegration {
    constructor(name, hinata, logger) {
        this.name = name;
        this.hinata = hinata;
        this.logger = logger;
    }

    async run() {
        throw new Error('Not Implemented');
    }

    getName() {
        return this.name;
    }

    getHinata() {
        return this.hinata;
    }

    getOptions() {
        return this.getHinata().getOption(this.getName().toLowerCase(), {});
    }

    getOption(key, def) {
        key = [this.getName().toLowerCase(), key].join('=>');

        return this.getHinata().getOption(key, def);
    }

    getLogger() {
        if (!this.logger) {
            this.logger = this.getHinata().getLogger().createNewLogger(['Integrations', this.getName()]);
        }

        return this.logger;
    }
}

module.exports = BaseIntegration;