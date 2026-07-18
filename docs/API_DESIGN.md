# API Design Document - YYC³ Cloud Cube

## Overview
This document outlines the RESTful API design for the YYC³ application, utilizing Supabase (PostgreSQL + PostgREST) as the backend.
The design prioritizes data security (RLS), scalability, and strictly adheres to the "Voice Fault" constraint.

## Authentication
Authentication is handled via Supabase Auth.
- **Headers**: `Authorization: Bearer <access_token>`
- **Security**: All endpoints below are protected by Row Level Security (RLS) policies. Users can only access their own data.

## Resources

### 1. Profiles
Manage user preferences and themes.

- **GET /rest/v1/profiles**
  - Fetch current user profile.
  - Response: `{ id: "uuid", theme_preference: "cyan" }`

- **PATCH /rest/v1/profiles?id=eq.<uuid>**
  - Update theme or avatar.
  - Body: `{ "theme_preference": "red" }`

### 2. AI Configurations (`ai_configs`)
Store LLM provider settings securely.

- **GET /rest/v1/ai_configs**
  - List all configurations.
- **POST /rest/v1/ai_configs**
  - Create new config.
  - Body: `{ "provider": "ollama", "base_url": "...", "is_active": true }`
  - *Note*: API Keys should ideally be stored in encrypted columns or client-side. This design assumes standard storage for MVP.

### 3. Workflows (`workflows`)
DAG definitions for automation.

- **Model**:
  ```json
  {
    "id": "uuid",
    "definition": {
       "nodes": [...],
       "edges": [...]
    }
  }
  ```

- **GET /rest/v1/workflows**
- **POST /rest/v1/workflows**
  - **Validation**: Server-side trigger or client-side check must ensure NO `audio_synth` nodes are present.

### 4. Workflow Runs (`workflow_runs`)
Execution history and logs.

- **GET /rest/v1/workflow_runs?workflow_id=eq.<uuid>**
  - Get history for a specific workflow.
- **POST /rest/v1/workflow_runs**
  - Log a new run result (pushed from client after execution).

## Error Handling

Standard HTTP status codes:
- `200 OK`: Success
- `401 Unauthorized`: Missing/Invalid Token
- `403 Forbidden`: RLS Violation (Accessing other user's data)
- `400 Bad Request`: Validation failure (e.g., Cycle in DAG)
- `422 Unprocessable Entity`: Semantic error (e.g., containing 'Voice' node)

## Performance & Scalability

- **Database**:
  - Indexed on `user_id` for all tables.
  - JSONB columns for flexible schema (`definition`, `logs`).
- **Optimization**:
  - Use Supabase `select` query params to fetch partial data.
  - Client-side execution of DAGs reduces server load; server stores state.

## Security Checklist

- [x] RLS enabled on all tables.
- [x] Input validation for DAG structure.
- [x] "Voice" module strictly blocked in validation logic.
- [x] API Keys handled with caution (User specific).
