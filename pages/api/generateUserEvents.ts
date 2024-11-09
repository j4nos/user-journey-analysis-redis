// pages/api/generateUserEvents.ts

import { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId, Db } from 'mongodb'
import { connectToDatabase } from '../../lib/connectToDatabase'

// Define the structure of the response document
interface Document {
	_id: ObjectId
	events: string[]
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		// Connect to the MongoDB database
		const { mongoClient } = await connectToDatabase()
		const db: Db = mongoClient.db(process.env.DB_NAME)

		// Get 'n' from the query parameters or default to 10
		const n = parseInt(req.query.n as string) || 10

		// Generate and insert 'n' mock documents one by one
		for (let i = 0; i < n; i++) {
			const document = generateMockDocument()
			await db.collection('users_events').insertOne(document)
		}

		// Respond with a success message
		res
			.status(200)
			.json({ message: 'Documents generated and saved successfully', count: n })
	} catch (error) {
		console.error('Error:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
}

// Function to generate a single mock document
function generateMockDocument(): Document {
	// Use all the alphabets from 'A' to 'Z'
	const possibleEvents: string[] = Array.from({ length: 26 }, (_, i) =>
		String.fromCharCode(65 + i)
	) // Generates ['A', 'B', 'C', ..., 'Z']

	const randomEvents = generateRandomEvents(possibleEvents)
	return {
		_id: new ObjectId(), // Generate a unique MongoDB ObjectId
		events: randomEvents,
	}
}

// Helper function to generate a random array of events
function generateRandomEvents(eventsPool: string[]): string[] {
	const eventCount = Math.floor(Math.random() * eventsPool.length) + 1 // Random number of events
	const selectedEvents: string[] = []

	while (selectedEvents.length < eventCount) {
		const randomEvent =
			eventsPool[Math.floor(Math.random() * eventsPool.length)]
		if (!selectedEvents.includes(randomEvent)) {
			selectedEvents.push(randomEvent) // Ensure unique events
		}
	}

	return selectedEvents
}
