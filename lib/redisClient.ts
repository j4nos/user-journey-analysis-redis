// lib/redisClient.ts

import { createClient } from 'redis'

// Create and configure the Redis client
const redisClient = createClient({
	url: process.env.REDIS_URL || 'redis://localhost:6379', // Replace with your actual Redis URL if needed
})

// Handle client errors
redisClient.on('error', (err) => {
	console.error('Redis Client Error:', err)
})

// Connect to Redis
;(async () => {
	try {
		await redisClient.connect()
		console.log('Connected to Redis')
	} catch (err) {
		console.error('Failed to connect to Redis:', err)
	}
})()

export default redisClient
