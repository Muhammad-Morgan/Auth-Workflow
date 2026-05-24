import { MongoClient } from 'mongodb';
import {
    ObjectId
} from 'mongodb';

/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

const agg = [
    {
        '$match': {
            'product': new ObjectId('69fca008a5f689b48f7be5eb')
        }
    }, {
        '$group': {
            '_id': null,
            'averageRating': {
                '$avg': '$rating'
            },
            'numberOfReviews': {
                '$sum': 1
            }
        }
    }
];

const client = await MongoClient.connect(
    'mongodb://ac-hjgrpxl-shard-00-01.zbdways.mongodb.net,ac-hjgrpxl-shard-00-00.zbdways.mongodb.net,ac-hjgrpxl-shard-00-02.zbdways.mongodb.net/?tls=true&authMechanism=MONGODB-X509&authSource=%24external&maxIdleTimeMS=45000&minPoolSize=0&replicaSet=atlas-3xsmo1-shard-0&appName=Data+Explorer--69ad8fa97f876f9874acec7f'
);
const coll = client.db('e-commerce-api').collection('reviews');
const cursor = coll.aggregate(agg);
const result = await cursor.toArray();
await client.close();