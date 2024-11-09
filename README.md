# Research on MongoDB and Redis Performance

## Overview

This document summarizes the performance testing conducted on MongoDB and Redis for querying events and caching results. The aim was to measure the query time when fetching data directly from MongoDB compared to using Redis for caching part of the data.

## Test Environment

- **Database**: MongoDB
- **Cache**: Redis
- **Number of Events**: 100,000
- **Tools**: RedisInsight for Redis management, Node.js/Next.js for API handling

## Results

### Query Performance

1. **Direct MongoDB Query (No Redis Caching)**

   - **Query Time**: 268.13 ms
   - **Match Count**: 10,378

   **Observation**: Querying directly from MongoDB without caching provided consistent results but took longer to process compared to cached queries.

2. **Query with Redis Caching**

   - **Initial Query (with cache miss)**:

     - **Query Time**: 3,681.65 ms
     - **Match Count**: 10,378

     **Observation**: The first query involving Redis is slower when data is not yet cached. This is because data needs to be fetched from MongoDB and then stored in Redis.

   - **Subsequent Query (with cache hit)**:

     - **Query Time**: 48.21 ms
     - **Match Count**: 10,378

     **Observation**: When part of the set is already cached, subsequent queries are significantly faster due to the quick access provided by Redis.

### Key Insights

- **Initial Setup Overhead**: The first query involving Redis is slower due to data population in the cache. This overhead is expected and diminishes with repeated access.
- **Cache Efficiency**: Once data is cached, Redis dramatically reduces query time, offering a performance boost compared to direct MongoDB queries.
- **Scalability**: Using Redis as a caching layer is beneficial for repeated queries on large datasets where response time is critical.

## Conclusion

Integrating Redis for caching significantly improves the query performance for subsequent data access once the data is stored in the cache. However, initial caching incurs a performance hit due to data population. The results demonstrate that for applications with frequent repeated queries, using Redis as a caching layer provides notable benefits.

## Recommendations

- **Use Redis Caching for Repeated Reads**: Implement Redis for scenarios where data is queried frequently to take advantage of the faster query time.
- **Monitor Cache Population**: Be mindful of the initial data population time when adding data to the cache for the first time.
- **Hybrid Approach**: For mixed workloads, consider using a combination of direct MongoDB queries and Redis caching to balance initial query performance and subsequent speed.

## Future Work

- **Large-Scale Testing**: Perform tests with larger datasets (e.g., 1,000,000 events) to analyze the impact on scalability.
- **Memory Management**: Monitor and optimize Redis memory usage to ensure efficient caching without memory overflows.
- **Distributed Caching**: Explore using distributed Redis clusters for handling larger scales and more complex queries.

## How to Execute the Code

### Prerequisites

Ensure that the following are installed on your system:

- **Node.js** (v14.x or higher)
- **MongoDB** (with a running instance)
- **Redis** (with a running instance)
- **RedisInsight** (optional, for managing Redis)

### Installation Steps

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-repo/your-project.git
   cd your-project
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory and add the following:
   ```env
   DB_NAME=your-database-name
   REDIS_URL=redis://localhost:6379
   ```

### Running the Application

Start the Next.js server with the following command:

```bash
npm run dev
```

### Using the Endpoints

1. **Generate User Events (`generateUserEvents`)**:

   - URL: `http://localhost:3000/api/generateUserEvents?n=100000`
   - This endpoint generates `n` mock user events and stores them in MongoDB.

2. **Search User Events (`searchUserEvents`)**:

   - URL: `http://localhost:3000/api/searchUserEvents`
   - Method: `POST`
   - Body:
     ```json
     {
     	"events": ["A", "B", "C"]
     }
     ```
   - This endpoint searches for documents in MongoDB that contain the specified events.

3. **Search User Events with Redis Caching (`searchUserEventsWithRedis`)**:
   - URL: `http://localhost:3000/api/searchUserEventsWithRedis`
   - Method: `POST`
   - Body:
     ```json
     {
     	"events": ["A", "B", "C"]
     }
     ```
   - This endpoint uses Redis as a caching layer to optimize the search process.

### Expected Results

- **`generateUserEvents`**: Populates the database with 100,000 user events.
- **`searchUserEvents`**: Queries the database directly and returns matching results.
- **`searchUserEventsWithRedis`**: Checks Redis for cached data, falling back to MongoDB if not found, and caches the results for future use.

### Performance Comparison

- Initial query with Redis caching is slower due to cache population.
- Subsequent queries using Redis are significantly faster.

### Example API Calls

```bash
# Generate 100,000 user events
curl "http://localhost:3000/api/generateUserEvents?n=100000"

# Search for user events directly from MongoDB
curl -X POST -H "Content-Type: application/json" -d '{"events":["A","B","C"]}' http://localhost:3000/api/searchUserEvents

# Search for user events with Redis caching
curl -X POST -H "Content-Type: application/json" -d '{"events":["A","B","C"]}' http://localhost:3000/api/searchUserEventsWithRedis
```

---

Follow these instructions to test the performance of each method and compare the query times.

## Context of the Analysis

This project focuses on **user journey analysis**, where the goal is to identify patterns in user behavior by analyzing logs of user events. For simplicity, each type of event in the logs table is represented by a letter of the alphabet (e.g., 'A', 'B', 'C', etc.).

### Data Structure

- **User Events**: Events are already grouped by users, and the sequence of events for each user is stored as an array. These arrays are time-ordered, meaning that the order of events in the array corresponds to the chronological order in which they occurred.

### Objective

The objective of this analysis is to determine which users have gone through certain patterns or nodes in the event graph and how many have completed these journeys. The analysis aims to optimize this process and make it faster by leveraging different data management and caching strategies.

### Key Points of Examination

- **Direct MongoDB Queries**: Analyze the performance of querying MongoDB directly for event patterns.
- **Redis Caching**: Examine the impact of caching event data in Redis to improve query performance for repeated searches.
- **Performance Comparison**: Identify the performance differences between direct database access and cached data retrieval to determine the most efficient approach.

### Goal

The ultimate goal of this examination is to find the best strategy for making user journey pattern searches faster and more efficient.
