const {v5: {generate: generateV5UUID}, v4: {generate: generateV4UUID}} = require('codingseaotter-uuid');
const {ObjectID} = require('mongodb');

const {COLLECTIONS, API_KEY_NAMESPACE} = require('../../utilities/constants.js');

const provisionFXServer = async ({database}, {address}) => {
    const api_key = generateV5UUID(generateV4UUID(), API_KEY_NAMESPACE);
    const collection = database.getDatabase().collection(COLLECTIONS.FXServer);
    const document = {
        address,
        api_key,
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

const findAll = async ({database}) => {
    const collection = database.getDatabase().collection(COLLECTIONS.FXServer);

    return collection.find({}).toArray();
}

module.exports = {
    provisionFXServer,
    findAll
};