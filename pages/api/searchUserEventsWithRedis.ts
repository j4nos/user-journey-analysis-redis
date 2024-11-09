import { NextApiRequest, NextApiResponse } from 'next'
import { Db, ObjectId } from 'mongodb'
import { connectToDatabase } from '../../lib/connectToDatabase'
import redisClient from '../../lib/redisClient'

// Define the structure of the MongoDB document
interface UserEventDocument {
	_id: ObjectId
	events: string[]
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === 'POST') {
		try {
			// Start timing the query
			const startTime = process.hrtime()

			// Connect to MongoDB
			const { mongoClient } = await connectToDatabase()
			const db: Db = mongoClient.db(process.env.DB_NAME)

			// Get the list of events from the request body
			const { events } = req.body

			if (!events || !Array.isArray(events) || events.length === 0) {
				return res.status(400).json({ error: 'Invalid or missing events list' })
			}

			// Iterate over each event, fetch documents from MongoDB, and store them in Redis
			for (const event of events) {
				const key: string = String(event) // Ensure the key is a string
				const exists = await redisClient.exists(key)
				if (!exists) {
					// Query MongoDB for documents that contain this event
					const documents: UserEventDocument[] = await db
						.collection<UserEventDocument>('users_events')
						.find({
							events: event,
						})
						.toArray()

					// Extract unique document identifiers or relevant fields to store in Redis
					const documentIds: string[] = documents.map(
						(doc) => `doc_${doc._id.toString()}`
					)

					// Ensure the Redis command parameters match the expected types
					if (documentIds.length > 0) {
						await redisClient.sAdd(key, documentIds)
					}
				}
			}

			// Calculate the intersection of the sets for the given events
			const intersection = await redisClient.sInter(
				events.map((event) => String(event))
			) // Ensure all keys are strings

			// End timing the query and calculate duration
			const [seconds, nanoseconds] = process.hrtime(startTime)
			const queryTimeMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2) // Query time in milliseconds

			// Respond with the intersection results, match count, and query time
			res.status(200).json({
				queryTimeMs: `${queryTimeMs} ms`,
				matchCount: intersection.length, // Include the number of matches
				matchingDocuments: intersection,
			})
		} catch (error) {
			console.error('Error:', error)
			res.status(500).json({ error: 'Internal server error' })
		}
	} else {
		res.status(405).json({ error: 'Method not allowed' })
	}
}
