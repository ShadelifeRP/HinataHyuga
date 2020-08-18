const {ObjectID} = require('mongodb');

const {COLLECTIONS} = require('../../utilities/constants.js');

const provisionFXServer = async ({database}, {address, api_key, guild_id}) => {
    const collection = database.collection(COLLECTIONS.FXServer);
    const document = {
        address,
        api_key,
        guild: guild_id,
        metadata: {
            created: new Date(),
            version: 1,
            history: []
        }
    }

    const result = await collection.insertOne(document)

    if (!result || !result.insertedId) {
        throw new Error('Nothing Was Inserted');
    }

    Object.assign(document, {_id: new ObjectID(result.insertedId)});

    return document;
}

const updateAPIKey = async ({database}, _id, api_key) => {
    const collection = database.collection(COLLECTIONS.FXServer);
    const now = new Date();
    const find = {
        _id: new ObjectID(_id)
    };
    const update = {
        $set: {
            api_key,
            "metadata.updated": now,
        },
        $push: {
            "metadata.history": {
                "type": "refresh_api_key",
                "date": now
            }
        }
    };
    const result = await collection.updateOne(find, update);

    return result && result.result.nModified > 0;
};

const findAll = async ({database}) => {
    const collection = database.getDatabase().collection(COLLECTIONS.FXServer);

    return collection.find({}).toArray();
}

module.exports = {
    provisionFXServer,
    findAll,
    updateAPIKey
};