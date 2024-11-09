// pages/api/searchUserEvents.ts

import { NextApiRequest, NextApiResponse } from 'next'
import { Db } from 'mongodb'
import { connectToDatabase } from '../../lib/connectToDatabase'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === 'POST') {
		try {
			// Start measuring query time
			const startTime = process.hrtime()

			// Connect to the MongoDB database
			const { mongoClient } = await connectToDatabase()
			const db: Db = mongoClient.db(process.env.DB_NAME)

			// Get the list of events from the request body
			const { events } = req.body

			if (!events || !Array.isArray(events) || events.length === 0) {
				return res.status(400).json({ error: 'Invalid or missing events list' })
			}

			// Find documents that contain all the provided events, projecting only the _id field
			const matchingDocuments = await db
				.collection('users_events')
				.find({
					events: { $all: events },
				})
				.project({ _id: 1 }) // Only include the _id field
				.toArray()

			// Extract just the IDs from the matching documents
			const matchingIds = matchingDocuments.map((doc) => doc._id)

			// End measuring query time
			const [seconds, nanoseconds] = process.hrtime(startTime)
			const queryTimeMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2) // Query time in milliseconds

			// Respond with the matching IDs, count of matches, and query time
			res.status(200).json({
				queryTimeMs: `${queryTimeMs} ms`,
				matchCount: matchingIds.length,
				matchingIds,
			})
		} catch (error) {
			console.error('Error:', error)
			res.status(500).json({ error: 'Internal server error' })
		}
	} else {
		res.status(405).json({ error: 'Method not allowed' })
	}
}
