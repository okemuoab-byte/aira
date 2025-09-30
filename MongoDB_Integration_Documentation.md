# MongoDB Integration Documentation

## 1. MongoDB Integration Overview

This document provides a comprehensive overview of the successful integration of MongoDB Atlas as the primary database for the Health Journey application. The project involved migrating from a mock database to a robust, scalable, and fully-featured MongoDB instance. This transition enhances data persistence, scalability, and performance, laying a solid foundation for future development.

The integration was completed with a 100% success rate across all 29 integration tests, ensuring full compatibility with the existing API and frontend functionalities. The Pydantic models were enhanced to support MongoDB's `ObjectId`, and comprehensive CRUD (Create, Read, Update, Delete) operations were implemented for all data entities.

### Key Accomplishments:
- **Successful Transition**: Seamlessly migrated from a mock database to MongoDB Atlas.
- **Full Test Coverage**: All 29 integration tests passed, validating the integration's correctness and stability.
- **Enhanced Data Models**: Pydantic models were updated to be fully compatible with MongoDB, including `ObjectId` support.
- **Comprehensive CRUD Operations**: Implemented robust and error-handled CRUD operations for all collections.
- **Optimized Performance**: Created optimized indexes for all collections to ensure efficient data retrieval.
- **Maintained API Compatibility**: The API endpoints and data structures remain fully compatible with the frontend, requiring no changes to the client-side application.

## 2. Technical Architecture

The backend is built with FastAPI and communicates with a MongoDB Atlas cluster. The database connection is managed by the `motor` asynchronous driver, which is well-suited for high-performance applications.

### Database Design
The database is designed with a document-oriented approach, where each collection stores a specific type of data (e.g., users, symptoms, medications). This design allows for flexible and scalable data storage.

### Collections
The following collections are used in the database:

- `users`: Stores user profile information, including authentication details.
- `symptoms`: Logs user-reported symptoms.
- `medications`: Manages user's medication schedules and history.
- `dose_logs`: Tracks medication doses (taken, missed, or skipped).
- `visits` (healthcare_visits): Records healthcare appointments and visits.
- `family_members`: Manages family member profiles and their access rights.
- `photos`: Stores images uploaded by users, typically associated with symptoms.
- `share_settings`: Manages data sharing preferences for each user.

### Relationships
Relationships between collections are managed using `PyObjectId` references. For example, a `symptom` document contains a `user_id` field that references a document in the `users` collection. This approach maintains data integrity while allowing for efficient queries.

## 3. API Changes

No breaking changes were made to the public-facing API. The transition from the mock database to MongoDB was designed to be seamless, ensuring that the frontend application continues to function without any modifications.

- **Endpoints**: All existing API endpoints remain unchanged.
- **Data Structures**: The JSON data structures for requests and responses are consistent with the previous implementation. The `id` fields are now represented as MongoDB `ObjectId` strings.

## 4. Database Schema

The database schema is defined using Pydantic models, which provide data validation and serialization. Below is a detailed description of each collection's schema.

### `users` Collection
- `_id`: `ObjectId` - Unique identifier for the user.
- `email`: `string` - User's email address (unique).
- `name`: `string` - User's full name.
- `password_hash`: `string` - Hashed password for authentication.
- `birthday`: `datetime` - User's date of birth.
- `gender`: `string` - User's gender (`male`, `female`, `other`, `prefer_not_to_say`).
- `height`: `object` - User's height (e.g., `{"value": 175, "unit": "cm"}`).
- `weight`: `object` - User's weight (e.g., `{"value": 70, "unit": "kg"}`).
- `conditions`: `array` of `string` - List of medical conditions.
- `family_history`: `array` of `object` - List of family medical history records.
- `preferences`: `object` - User-specific application preferences.
- `is_active`: `boolean` - Flag indicating if the user account is active.
- `email_verified`: `boolean` - Flag indicating if the user's email has been verified.
- `last_login`: `datetime` - Timestamp of the last login.
- `created_at`: `datetime` - Timestamp of when the user was created.
- `updated_at`: `datetime` - Timestamp of the last update.
- `deleted_at`: `datetime` - Timestamp for soft deletes.

### `symptoms` Collection
- `_id`: `ObjectId` - Unique identifier for the symptom log.
- `user_id`: `ObjectId` - Reference to the user who logged the symptom.
- `body_part_id`: `string` - Identifier for the body part.
- `body_part_name`: `string` - Name of the body part.
- `type`: `string` - Type of symptom (e.g., "pain", "rash").
- `intensity`: `integer` - Symptom intensity on a scale of 1 to 10.
- `notes`: `string` - Additional notes about the symptom.
- `coordinates`: `object` - `x` and `y` coordinates on a body map.
- `photos`: `array` of `object` - Associated photos.
- `timestamp`: `datetime` - When the symptom was recorded.
- `created_at`: `datetime` - Timestamp of when the log was created.
- `updated_at`: `datetime` - Timestamp of the last update.
- `deleted_at`: `datetime` - Timestamp for soft deletes.

### `medications` Collection
- `_id`: `ObjectId` - Unique identifier for the medication.
- `user_id`: `ObjectId` - Reference to the user.
- `name`: `string` - Name of the medication.
- `dosage`: `string` - Dosage information (e.g., "10mg").
- `frequency`: `string` - How often the medication is taken (e.g., "daily").
- `times`: `array` of `string` - Specific times to take the medication (e.g., `["08:00", "20:00"]`).
- `start_date`: `datetime` - When the medication was started.
- `end_date`: `datetime` - When the medication is scheduled to end.
- `reminder_enabled`: `boolean` - Whether reminders are enabled.
- `created_at`: `datetime` - Timestamp of when the medication was added.
- `updated_at`: `datetime` - Timestamp of the last update.

... (and so on for the other collections: `dose_logs`, `visits`, `family_members`, `photos`, `share_settings`)

## 5. Setup and Configuration

To connect the backend application to MongoDB, you need to configure the following environment variable:

- `MONGODB_URI`: The connection string for your MongoDB Atlas cluster.

This variable should be placed in a `.env` file in the `backend` directory.

Example `.env` file:
```
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority"
```

The database connection logic is handled in `backend/database.py`. The `connect_to_mongodb` function initializes the connection pool and sets up the database instance.

## 6. Testing Results

The MongoDB integration was rigorously tested to ensure its stability and correctness. All 29 existing integration tests were adapted and executed against the MongoDB database, and all tests passed with a 100% success rate.

The tests cover:
- User authentication (signup, login).
- CRUD operations for all collections.
- Data validation and error handling.
- User data isolation.

The full test report can be found in `backend/mongodb_integration_test_report_final.json`.

## 7. Performance Considerations

Performance is a critical aspect of the application. The following strategies have been implemented to ensure optimal performance:

### Indexing Strategy
Indexes have been created for all collections to speed up query performance. The indexing strategy is defined in the Pydantic models (e.g., `UserInDB.get_indexes()`) and applied when the application starts.

Key indexed fields include:
- `users.email` (unique)
- `symptoms.user_id` and `symptoms.timestamp`
- `medications.user_id` and `medications.name`

For a complete list of indexes, refer to the `get_indexes` method in the respective `...InDB` models in `backend/models.py`.

### Asynchronous Driver
The use of the `motor` asynchronous driver for MongoDB allows the application to handle a high number of concurrent requests without blocking, which is essential for a responsive API.

## 8. Troubleshooting Guide

Here are some common issues and their solutions:

- **Connection Errors**:
  - **Issue**: The application fails to connect to MongoDB.
  - **Solution**:
    1. Verify that the `MONGODB_URI` in your `.env` file is correct.
    2. Ensure that your IP address is whitelisted in your MongoDB Atlas cluster's security settings.
    3. Check the MongoDB Atlas cluster status to ensure it's running.

- **Authentication Errors**:
  - **Issue**: User login fails.
  - **Solution**:
    1. Ensure the user exists in the `users` collection.
    2. Verify that the password hashing and comparison logic is correct.

- **Slow Queries**:
  - **Issue**: API requests are taking a long time to complete.
  - **Solution**:
    1. Use the MongoDB Atlas profiler to identify slow queries.
    2. Ensure that the query is using an appropriate index. If not, consider adding a new index.

## 9. Migration Notes

The transition from the mock database to MongoDB was handled as follows:

- **Data Models**: The Pydantic models were updated to include `PyObjectId` for ID fields and to define MongoDB-specific indexes.
- **Database Logic**: The database interaction logic in `backend/database.py` was rewritten to use `motor` for asynchronous MongoDB operations.
- **API Endpoints**: The API endpoints in the `backend/routes/` directory were updated to call the new database functions.
- **Testing**: The integration tests were updated to connect to a test MongoDB database and validate the new implementation.

No data migration was required since the mock database was in-memory and did not persist data.