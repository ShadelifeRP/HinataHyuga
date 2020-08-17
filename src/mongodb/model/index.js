const {ObjectID} = require('mongodb');

class DatabaseModel {
    constructor(document, hinata) {
        this.document = document;
        this.hinata = hinata;

        this.normalize();
    }

    /**
     *
     * @param document
     * @returns {number} version
     */
    static determineVersion(document) {
        const version = parseInt(document.metadata.version);

        return version;
    }

    normalize() {
        this._normalizeMetadata();
        const function_call = `_normalizeV${this.getVersion()}`;

        this[function_call]();
    }

    _normalizeMetadata() {
        const {
            _id,
            metadata
        } = this.getDocument();

        this.id = _id instanceof ObjectID ? _id : new ObjectID(_id);
        this.metadata = metadata;
    }

    getID() {
        return this.id;
    }

    getMetadata() {
        return this.metadata || {};
    }

    getType() {
        return this.getMetadata().type;
    }

    getCreationDate() {
        return this.getMetadata().created;
    }

    getLastUpdate() {
        return this.getMetadata().updated;
    }

    getVersion() {
        return this.getMetadata().version;
    }

    isDeleted() {
        return this.getMetadata().deleted;
    }

    getDocument() {
        return this.document;
    }

    getHinata() {
        return this.hinata;
    }
}

module.exports = DatabaseModel;