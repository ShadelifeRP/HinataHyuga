class HinataError extends Error {
    constructor(code, ...args) {
        super(...args);

        this.code = code;
    }
}

module.exports = HinataError;