# Backend Development Plan - Health Journey Platform

## 1) Executive Summary

**What will be built:** A comprehensive backend API for the Health Journey Platform - serving as the "Google Maps for your illness" with chronic care management, symptom tracking, medication management, family sharing, and AI-powered health insights.

**Why:** The frontend requires a robust backend to support real-time health data management, family collaboration, medication tracking, and secure health information sharing with HIPAA-compliant privacy controls.

**Constraints honored:** 
- FastAPI (Python 3.12) with async architecture
- MongoDB Atlas with Motor driver and Pydantic v2 models
- No Docker deployment
- Frontend-driven manual testing through UI workflows
- Single `main` branch Git workflow
- API base path `/api/v1/*`

**Sprint count:** Dynamic approach with 6 sprints (S0-S5) to fully cover all discovered frontend features including body mapping, systemic symptoms, medication tracking, family sharing, and health insights.

## 2) In-scope & Success Criteria

**In-scope:**
- User authentication and profile management with medical privacy controls
- Comprehensive symptom logging with body part mapping and systemic symptoms
- Medication tracking with reminders, safety information, and adherence monitoring
- Family dashboard with granular sharing controls and privacy settings
- Health insights and AI-powered pattern analysis
- Photo capture and measurement tracking for visual symptoms
- Family history management and risk assessment
- Healthcare visit tracking and medical timeline

**Success criteria:**
- Users can complete full chronic care tracking workflow through the frontend
- Family members can access shared care summaries with appropriate permissions
- Medication reminders and safety information are accessible
- All symptom logging flows (body parts + systemic) work seamlessly
- Health insights and patterns are generated from user data
- Each sprint passes manual tests via the UI before pushing to `main`

## 3) API Design

**Conventions:**
- Base path: `/api/v1`
- RESTful design with consistent JSON responses
- Error model: `{"error": "message", "code": "ERROR_CODE", "details": {}}`
- Authentication via JWT tokens in Authorization header
- Filtering and sorting only where visible in frontend UI

**Endpoints:**

**Authentication & Users:**
- `POST /api/v1/auth/signup` - User registration with medical privacy consent
- `POST /api/v1/auth/login` - User login returning JWT token
- `POST /api/v1/auth/logout` - Token invalidation
- `GET /api/v1/auth/me` - Current user profile
- `PUT /api/v1/users/profile` - Update user profile and preferences
- `GET /api/v1/users/profile` - Get detailed user profile with family history

**Health Data:**
- `POST /api/v1/symptoms` - Log new symptom (body part or systemic)
- `GET /api/v1/symptoms` - Get user's symptom history with optional date filtering
- `PUT /api/v1/symptoms/{id}` - Update symptom entry (24-hour window)
- `DELETE /api/v1/symptoms/{id}` - Soft delete symptom entry
- `GET /api/v1/health/insights` - Get AI-generated health patterns and insights
- `GET /api/v1/health/dashboard` - Get dashboard summary data

**Medications:**
- `POST /api/v1/medications` - Add new medication
- `GET /api/v1/medications` - Get user's medications (active/past filtering)
- `PUT /api/v1/medications/{id}` - Update medication details
- `DELETE /api/v1/medications/{id}` - Remove medication
- `GET /api/v1/medications/{id}/safety` - Get safety information for medication
- `POST /api/v1/medications/{id}/doses` - Log dose taken/missed
- `GET /api/v1/medications/reminders` - Get upcoming medication reminders

**Family & Sharing:**
- `POST /api/v1/family/invite` - Invite family member
- `GET /api/v1/family/members` - Get family members list
- `PUT /api/v1/family/members/{id}` - Update family member permissions
- `DELETE /api/v1/family/members/{id}` - Remove family member
- `PUT /api/v1/family/settings` - Update sharing preferences
- `GET /api/v1/family/shared-data` - Get data shared with family (family member view)

**Healthcare Visits:**
- `POST /api/v1/visits` - Log healthcare visit
- `GET /api/v1/visits` - Get visit history
- `PUT /api/v1/visits/{id}` - Update visit details

**File Uploads:**
- `POST /api/v1/uploads/photos` - Upload symptom photos
- `GET /api/v1/uploads/photos/{id}` - Get photo by ID

## 4) Data Model (MongoDB Atlas)

**Collections:**

**users**
- `_id: ObjectId` - Primary key
- `email: str` - Unique user email (required)
- `password_hash: str` - Hashed password (required)
- `name: str` - Full name (required)
- `birthday: datetime` - Date of birth (required)
- `gender: str` - Gender identity
- `height: dict` - Height with value, unit, feet, inches
- `weight: dict` - Weight with value, unit, last_weighed
- `conditions: list[str]` - Health conditions
- `family_history: list[dict]` - Family medical history
- `preferences: dict` - User preferences for reminders, sharing
- `created_at: datetime` - Account creation timestamp
- `updated_at: datetime` - Last update timestamp

Example document:
```json
{
  "_id": ObjectId("..."),
  "email": "sarah@example.com",
  "password_hash": "$2b$12$...",
  "name": "Sarah Johnson",
  "birthday": ISODate("1978-03-15"),
  "gender": "female",
  "height": {"value": 165, "unit": "cm"},
  "weight": {"value": 68, "unit": "kg", "last_weighed": ISODate("2024-01-15")},
  "conditions": ["diabetes", "arthritis"],
  "preferences": {"photo_reminders": true, "medication_reminders": true}
}
```

**symptoms**
- `_id: ObjectId` - Primary key
- `user_id: ObjectId` - Reference to user (required)
- `body_part_id: str` - Body part identifier (optional for systemic)
- `body_part_name: str` - Human-readable body part name
- `type: str` - Symptom type/description (required)
- `intensity: int` - Intensity scale 1-10 (required)
- `notes: str` - Additional notes (optional)
- `coordinates: dict` - X,Y coordinates for body mapping (optional)
- `photos: list[dict]` - Associated photos with metadata
- `measurements: list[dict]` - Size/measurement data
- `triggers: list[str]` - Identified triggers
- `treatments: list[str]` - Applied treatments
- `food_history: list[str]` - Recent food consumption
- `timestamp: datetime` - When symptom occurred (required)
- `created_at: datetime` - Log entry timestamp
- `updated_at: datetime` - Last modification timestamp

Example document:
```json
{
  "_id": ObjectId("..."),
  "user_id": ObjectId("..."),
  "body_part_id": "left-knee",
  "body_part_name": "Left Knee",
  "type": "joint pain",
  "intensity": 6,
  "notes": "Worse in the morning, improves with movement",
  "timestamp": ISODate("2024-01-15T08:30:00Z")
}
```

**medications**
- `_id: ObjectId` - Primary key
- `user_id: ObjectId` - Reference to user (required)
- `name: str` - Medication name (required)
- `dosage: str` - Dosage information (required)
- `frequency: str` - Frequency schedule (required)
- `times: list[str]` - Specific reminder times
- `start_date: datetime` - Start date (required)
- `end_date: datetime` - End date (optional)
- `notes: str` - Additional notes
- `reminder_enabled: bool` - Reminder preference
- `side_effects: list[str]` - Tracked side effects
- `effectiveness: int` - Effectiveness rating 1-10
- `adherence_rate: float` - Calculated adherence percentage
- `missed_doses: list[dict]` - Missed dose records
- `created_at: datetime` - Creation timestamp
- `updated_at: datetime` - Last update timestamp

**family_members**
- `_id: ObjectId` - Primary key
- `user_id: ObjectId` - Reference to primary user (required)
- `name: str` - Family member name (required)
- `email: str` - Family member email (required)
- `relationship: str` - Relationship type (required)
- `access_level: str` - Access permission level (required)
- `shared_data: list[str]` - Types of data shared
- `invite_status: str` - Invitation status
- `invited_date: datetime` - Invitation timestamp
- `accepted_date: datetime` - Acceptance timestamp (optional)
- `last_access: datetime` - Last access timestamp (optional)

**healthcare_visits**
- `_id: ObjectId` - Primary key
- `user_id: ObjectId` - Reference to user (required)
- `date: datetime` - Visit date (required)
- `provider_type: str` - Type of healthcare provider (required)
- `provider_name: str` - Provider/facility name
- `reason_for_visit: str` - Visit reason (required)
- `summary: str` - Visit summary
- `diagnosis: str` - Diagnosis information
- `treatment_plan: str` - Treatment plan
- `prescriptions: list[str]` - New prescriptions
- `referrals: list[str]` - Referrals made
- `follow_up_required: bool` - Follow-up needed
- `follow_up_date: datetime` - Next appointment date

**photos**
- `_id: ObjectId` - Primary key
- `user_id: ObjectId` - Reference to user (required)
- `symptom_id: ObjectId` - Reference to symptom (optional)
- `filename: str` - Original filename
- `file_path: str` - Storage path
- `description: str` - Photo description
- `measurements: dict` - Size measurements if applicable
- `timestamp: datetime` - Photo timestamp
- `created_at: datetime` - Upload timestamp

## 5) Frontend Audit & Feature Map

**Routes/Components Analysis:**

**Main Application (`Index.tsx`)**
- Route: `/` (single-page application)
- Purpose: Main health tracking interface with tabbed navigation
- Data needed: User profile, symptoms, medications, family members
- Backend capability: User authentication, profile management, data aggregation
- Auth requirement: Required for all functionality

**Symptom Logging (`SymptomLogger.tsx`)**
- Component: Interactive symptom logging with body mapping
- Purpose: Log symptoms on body parts or systemic changes
- Data needed: Body part definitions, symptom suggestions, user conditions
- Backend capability: `POST /api/v1/symptoms`, symptom categorization
- Auth requirement: User must be authenticated
- Notes: Supports both anatomical and systemic symptom logging

**Health Dashboard (`HealthDashboard.tsx`)**
- Component: Health insights and visual overview
- Purpose: Display health patterns, trends, and AI insights
- Data needed: Recent symptoms, health statistics, system breakdowns
- Backend capability: `GET /api/v1/health/dashboard`, `GET /api/v1/health/insights`
- Auth requirement: User authentication required

**Medication Tracker (`MedicationTracker.tsx`)**
- Component: Comprehensive medication management
- Purpose: Track medications, safety info, reminders, adherence
- Data needed: User medications, drug safety database, reminder schedules
- Backend capability: Full CRUD for medications, safety information lookup
- Auth requirement: User authentication required
- Notes: Includes drug interaction warnings and emergency information

**Family Dashboard (`FamilyDashboard.tsx`)**
- Component: Family sharing and privacy controls
- Purpose: Manage family access, sharing permissions, care summaries
- Data needed: Family members, sharing settings, health summaries
- Backend capability: Family member management, permission controls, data sharing
- Auth requirement: User authentication required

**Body Mapping (`ZoomableBodyMap.tsx`)**
- Component: Interactive anatomical body map
- Purpose: Visual symptom selection and display
- Data needed: Body part definitions, symptom locations, intensity mapping
- Backend capability: Body part data serving, symptom visualization data
- Auth requirement: Used within authenticated flows

**Systemic Symptoms (`SystemicSymptomLogger.tsx`)**
- Component: Whole-body symptom tracking
- Purpose: Log symptoms affecting entire body systems
- Data needed: Systemic symptom categories, condition-specific suggestions
- Backend capability: Systemic symptom logging, categorization
- Auth requirement: User authentication required

## 6) Configuration & ENV Vars (core only)

```bash
# Environment
APP_ENV=development

# Server
PORT=8000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/health_journey

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=86400

# CORS
CORS_ORIGINS=http://localhost:5137,http://localhost:3000
```

## 7) Testing Strategy (Manual via Frontend)

**Policy:** All validation occurs through the frontend UI by navigating screens, submitting forms, and verifying expected behavior. Network tab in DevTools can be used to verify API calls and responses.

**Per-sprint Manual Test Checklist (Frontend):** Each sprint includes specific UI test steps and expected outcomes that must pass before pushing to `main`.

**User Test Prompt:** Copy-pasteable instructions for human testers to verify functionality through the UI without technical knowledge.

**Post-sprint:** If manual tests pass through the frontend, commit all changes and push to GitHub `main`. If tests fail, fix issues and retest before pushing.

## 8) Dynamic Sprint Plan & Backlog (S0-S5)

### S0 - Environment Setup & Frontend Connection

**Objectives:**
- Create FastAPI skeleton with `/api/v1` base path and `/healthz` endpoint
- Set up MongoDB Atlas connection and basic health check
- Configure CORS for frontend origin
- Wire frontend to backend (replace dummy data with real API calls)
- Initialize Git repository and GitHub setup

**User Stories:**
- As a developer, I need a working backend that the frontend can connect to
- As a user, I want to see that the system is healthy and connected

**Tasks:**
- Set up FastAPI project structure with async support
- Create `/healthz` endpoint with MongoDB connectivity check
- Configure environment variables and MongoDB Atlas connection
- Set up CORS middleware for frontend communication
- Create basic error handling and response models
- Initialize Git repository with `.gitignore`
- Create GitHub repository and set `main` as default branch
- Update frontend API configuration to point to backend

**Definition of Done:**
- Backend runs locally on port 8000
- `/healthz` endpoint responds with 200 and shows DB connectivity status
- Frontend can successfully call backend endpoints
- Repository exists on GitHub with `main` branch
- CORS is properly configured for frontend origin

**Manual Test Checklist (Frontend):**
- Set `MONGODB_URI` environment variable
- Start backend server (`uvicorn main:app --reload`)
- Start frontend development server
- Open browser to frontend URL
- Verify no CORS errors in browser console
- Navigate to any page that would trigger API calls
- Check Network tab for successful `/healthz` calls

**User Test Prompt:**
```
1. Open the Health Journey app in your browser
2. You should see the main interface load without errors
3. If you see any error messages about "connection failed", report this
4. The app should feel responsive and ready to use
```

**Post-sprint:**
- Commit initial backend setup
- Push to GitHub `main` branch

### S1 - Basic Auth (signup, login, logout)

**Objectives:**
- Implement user registration with medical privacy consent
- Create secure login/logout with JWT tokens
- Protect at least one route and one frontend page
- Set up user profile management basics

**User Stories:**
- As a new user, I want to create an account to start tracking my health
- As a returning user, I want to log in securely to access my data
- As a user, I want to log out to protect my privacy

**Tasks:**
- Create User model with Pydantic v2 and MongoDB schema
- Implement password hashing with bcrypt/Argon2
- Create JWT token generation and validation
- Build auth endpoints: signup, login, logout, me
- Add authentication middleware for protected routes
- Create user profile CRUD operations
- Update frontend to handle authentication flow
- Add protected route examples

**Endpoints:**
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user profile

**Definition of Done:**
- Users can sign up with email/password through frontend
- Users can log in and receive JWT token
- Protected routes require valid authentication
- Users can log out and tokens are invalidated
- Frontend handles auth state properly

**Manual Test Checklist (Frontend):**
- Open the app and click "Sign Up" or register option
- Create a new account with email and password
- Verify successful registration and automatic login
- Log out using the logout button
- Log back in with the same credentials
- Try accessing a protected page without being logged in
- Verify you're redirected to login or see appropriate message

**User Test Prompt:**
```
1. Open the Health Journey app
2. Look for a "Sign Up" or "Create Account" button and click it
3. Fill in your email and create a password
4. You should be logged in automatically after signing up
5. Find the logout button (usually in the top right) and click it
6. Try to log back in with the same email and password
7. You should be able to access your account again
```

**Post-sprint:**
- Commit authentication system
- Push to GitHub `main` branch

### S2 - Symptom Logging & Body Mapping

**Objectives:**
- Implement comprehensive symptom logging for body parts
- Support systemic symptom tracking
- Enable photo uploads for visual symptoms
- Create symptom history and retrieval

**User Stories:**
- As a patient, I want to log symptoms on specific body parts to track my condition
- As a user, I want to log systemic symptoms that affect my whole body
- As a user, I want to add photos to document visual symptoms
- As a user, I want to see my symptom history and patterns

**Tasks:**
- Create Symptom model with body part and systemic support
- Implement symptom CRUD endpoints
- Add photo upload functionality with file storage
- Create body part data serving endpoints
- Build systemic symptom categorization
- Add symptom filtering and history retrieval
- Integrate with frontend symptom logging components
- Support symptom intensity, notes, and metadata

**Endpoints:**
- `POST /api/v1/symptoms` - Log new symptom
- `GET /api/v1/symptoms` - Get symptom history with filtering
- `PUT /api/v1/symptoms/{id}` - Update symptom (24-hour window)
- `DELETE /api/v1/symptoms/{id}` - Soft delete symptom
- `POST /api/v1/uploads/photos` - Upload symptom photos
- `GET /api/v1/uploads/photos/{id}` - Retrieve photos

**Definition of Done:**
- Users can log symptoms on body parts through the interactive map
- Users can log systemic symptoms (mood, sleep, appetite, etc.)
- Photo uploads work for visual symptom documentation
- Symptom history is retrievable and filterable
- All symptom logging flows in frontend work properly

**Manual Test Checklist (Frontend):**
- Click "Log Symptoms" in the main navigation
- Click on a body part in the interactive body map
- Fill in symptom details (type, intensity, notes)
- Save the symptom and verify it appears in your history
- Try logging a systemic symptom (like "mood changes")
- Upload a photo for a visual symptom
- Go to the overview/dashboard and verify symptoms appear
- Try editing a recent symptom entry

**User Test Prompt:**
```
1. Click the "Log Symptoms" button in the app
2. Click on any body part on the human figure (like your knee or shoulder)
3. Describe what you're feeling and rate the intensity from 1-10
4. Add any notes about when it started or what makes it better/worse
5. Click "Save Symptom"
6. Go to the "Overview" tab to see your logged symptom
7. Try clicking "General Health Changes" to log something like sleep or mood
8. Your symptoms should appear in your health dashboard
```

**Post-sprint:**
- Commit symptom logging system
- Push to GitHub `main` branch

### S3 - Medication Management & Safety

**Objectives:**
- Implement comprehensive medication tracking
- Add medication safety information and drug interactions
- Create medication reminder system
- Support adherence tracking and effectiveness rating

**User Stories:**
- As a patient, I want to track all my medications with dosages and schedules
- As a user, I want to see safety information and drug interactions for my medications
- As a user, I want medication reminders to help with adherence
- As a user, I want to track how effective my medications are

**Tasks:**
- Create Medication model with comprehensive fields
- Implement medication CRUD endpoints
- Build drug safety information database and lookup
- Create medication reminder logic
- Add adherence tracking and missed dose logging
- Implement effectiveness rating system
- Support medication scheduling and time management
- Integrate with frontend medication tracker

**Endpoints:**
- `POST /api/v1/medications` - Add new medication
- `GET /api/v1/medications` - Get medications (active/past filtering)
- `PUT /api/v1/medications/{id}` - Update medication
- `DELETE /api/v1/medications/{id}` - Remove medication
- `GET /api/v1/medications/{id}/safety` - Get safety information
- `POST /api/v1/medications/{id}/doses` - Log dose taken/missed
- `GET /api/v1/medications/reminders` - Get upcoming reminders

**Definition of Done:**
- Users can add medications with full details (name, dosage, schedule)
- Safety information displays for common medications
- Medication reminders are generated based on schedules
- Users can track adherence and effectiveness
- All medication management flows work in frontend

**Manual Test Checklist (Frontend):**
- Go to the "Medications" tab
- Click "Add Medication"
- Add a common medication like "Metformin" with dosage and schedule
- Save the medication and verify it appears in your list
- Click "Safety Info" to see drug interactions and warnings
- Set up reminder times and verify they appear
- Try editing the medication details
- Mark a dose as taken or missed
- Rate the medication's effectiveness

**User Test Prompt:**
```
1. Go to the "Medications" section of the app
2. Click "Add Medication"
3. Enter a medication name (like "Aspirin" or any medication you take)
4. Fill in the dosage (like "100mg") and how often you take it
5. Set reminder times if you want notifications
6. Save the medication
7. Click the "Safety Info" button to see important warnings
8. Your medication should now appear in your medications list
9. Try marking a dose as "taken" when it's time
```

**Post-sprint:**
- Commit medication management system
- Push to GitHub `main` branch

### S4 - Family Dashboard & Sharing

**Objectives:**
- Implement family member invitation and management
- Create granular sharing permissions and privacy controls
- Build family-friendly health summaries
- Support different access levels (view-only, emergency, caregiver)

**User Stories:**
- As a patient, I want to invite family members to see my health information
- As a user, I want to control exactly what health data is shared with whom
- As a family member, I want to see health summaries in easy-to-understand format
- As a user, I want different permission levels for different family members

**Tasks:**
- Create FamilyMember model with permission system
- Implement family invitation and management endpoints
- Build sharing permission controls and validation
- Create family-friendly health summary generation
- Add privacy settings and granular data sharing
- Support different access levels and relationship types
- Integrate with frontend family dashboard
- Add family notification system

**Endpoints:**
- `POST /api/v1/family/invite` - Invite family member
- `GET /api/v1/family/members` - Get family members
- `PUT /api/v1/family/members/{id}` - Update member permissions
- `DELETE /api/v1/family/members/{id}` - Remove family member
- `PUT /api/v1/family/settings` - Update sharing preferences
- `GET /api/v1/family/shared-data` - Get shared data (family view)

**Definition of Done:**
- Users can invite family members with email invitations
- Granular sharing controls work (symptoms, medications, photos, etc.)
- Different access levels function properly
- Family members can view appropriate health summaries
- Privacy settings are respected and enforced

**Manual Test Checklist (Frontend):**
- Go to the "Family" tab
- Click "Invite Family Member"
- Fill in family member details and choose what to share
- Set their access level (view only, emergency contact, caregiver)
- Send the invitation
- Adjust sharing settings for different types of data
- Verify the family summary shows appropriate information
- Test privacy controls by toggling different sharing options

**User Test Prompt:**
```
1. Go to the "Family" section of the app
2. Click "Invite Family Member"
3. Enter a family member's name and email
4. Choose their relationship to you (spouse, parent, child, etc.)
5. Select what information to share (symptoms, medications, etc.)
6. Choose their access level (view only is safest to start)
7. Send the invitation
8. Go to "Privacy Settings" to control what gets shared
9. You should see a summary of what your family can see about your health
```

**Post-sprint:**
- Commit family sharing system
- Push to GitHub `main` branch

### S5 - Health Insights & Dashboard

**Objectives:**
- Implement AI-powered health pattern analysis
- Create comprehensive health dashboard with insights
- Build trend analysis and symptom progression tracking
- Generate personalized health recommendations

**User Stories:**
- As a patient, I want to see patterns in my symptoms and health data
- As a user, I want AI insights about my health trends and potential triggers
- As a user, I want a comprehensive dashboard showing my health overview
- As a user, I want personalized recommendations based on my data

**Tasks:**
- Create health analytics and pattern detection algorithms
- Implement dashboard data aggregation endpoints
- Build symptom trend analysis and progression tracking
- Create AI-powered insight generation
- Add health recommendation system
- Implement body system analysis and breakdown
- Support time-based filtering and historical analysis
- Integrate with frontend dashboard components

**Endpoints:**
- `GET /api/v1/health/dashboard` - Get dashboard summary data
- `GET /api/v1/health/insights` - Get AI-generated insights and patterns
- `GET /api/v1/health/trends` - Get symptom trends and progression
- `GET /api/v1/health/recommendations` - Get personalized recommendations

**Definition of Done:**
- Health dashboard displays comprehensive overview with statistics
- AI insights identify patterns in user's health data
- Trend analysis shows symptom progression over time
- Personalized recommendations are generated based on user data
- All dashboard features work smoothly in frontend

**Manual Test Checklist (Frontend):**
- Go to the "Overview" tab to see your health dashboard
- Verify you see statistics like symptoms this week, average intensity
- Look for AI-generated insights about your health patterns
- Check that the body map shows your recent symptoms visually
- Verify trend information appears if you have multiple symptom entries
- Look for personalized recommendations or health tips
- Test different time period filters if available

**User Test Prompt:**
```
1. Go to the "Overview" section of the app
2. You should see a summary of your recent health activity
3. Look for insights about patterns in your symptoms
4. Check if the app shows which body parts or systems need attention
5. See if there are any recommendations for managing your health
6. The visual body map should show where you've logged symptoms
7. If you've been using the app for a while, look for trends over time
8. Everything should give you a clear picture of your health journey
```

**Post-sprint:**
- Commit health insights system
- Push to GitHub `main` branch

## Final Notes

This development plan provides a comprehensive backend foundation for the Health Journey Platform. Each sprint builds incrementally on the previous one, ensuring that the frontend functionality is fully supported with robust, scalable backend services. The manual testing approach through the frontend ensures that all features work as intended from the user's perspective.

The backend will support the complete chronic care management workflow, from initial symptom logging through family sharing and AI-powered insights, providing patients with the tools they need to manage their health journey effectively.