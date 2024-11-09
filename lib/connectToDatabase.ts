import { MongoClient, MongoClientEvents, TypedEventEmitter } from 'mongodb'
const uri = process.env.MONGODB_URI as string
const options = {}
let mongoClient: MongoClient

if (!process.env.MONGODB_URI) {
	throw new Error('Error')
}

export async function connectToDatabase() {
	try {
		if (mongoClient) {
			return { mongoClient }
		}
		mongoClient = await new MongoClient(uri, options).connect()
		return { mongoClient }
	} catch (e) {
		console.error(e)
		return { mongoClient }
	}
}
