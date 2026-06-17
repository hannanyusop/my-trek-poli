# Entity Relationship Diagram

This document describes the application data model used by MyTrek. It is based on the Laravel migrations in `database/migrations`.

## Rendered Diagram

![MyTrek Entity Relationship Diagram](./ERD.svg)

## Core ERD

```mermaid
erDiagram
    REGISTRATION_SESSIONS ||--o{ REGISTRATION_SESSION_TRACKS : configures
    REGISTRATION_SESSIONS ||--o{ STUDENTS : contains
    REGISTRATION_SESSIONS ||--o{ PLACEMENT_LOGS : records

    TRACKS ||--o{ REGISTRATION_SESSION_TRACKS : reused_as
    REGISTRATION_SESSION_TRACKS ||--o{ CLASSES : offers
    REGISTRATION_SESSION_TRACKS ||--o{ STUDENT_PREFERENCES : selected_in

    STUDENTS ||--o{ STUDENT_PREFERENCES : ranks
    STUDENTS ||--o{ PLACEMENTS : receives
    STUDENTS ||--o{ PLACEMENT_LOGS : audited_for

    CLASSES ||--o{ PLACEMENTS : assigned_to
    CLASSES ||--o{ PLACEMENT_LOGS : current_class
    CLASSES ||--o{ PLACEMENT_LOGS : previous_class

    USERS ||--o{ PLACEMENTS : admin_assigns
    USERS ||--o{ PLACEMENT_LOGS : performs

    USERS }o--o{ ROLES : model_has_roles
    ROLES }o--o{ PERMISSIONS : role_has_permissions
    USERS }o--o{ PERMISSIONS : model_has_permissions

    REGISTRATION_SESSIONS {
        bigint id PK
        string name
        string status
        string link_token UK
        timestamp start_date
        timestamp end_date
        text description
        boolean enable_public_registration
        timestamp created_at
        timestamp updated_at
    }

    TRACKS {
        bigint id PK
        string name
        text description
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    REGISTRATION_SESSION_TRACKS {
        bigint id PK
        bigint registration_session_id FK
        bigint track_id FK
        string name
        text description
        timestamp created_at
        timestamp updated_at
    }

    CLASSES {
        bigint id PK
        bigint registration_session_track_id FK
        string name
        integer quota
        integer current_count
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    STUDENTS {
        bigint id PK
        bigint registration_session_id FK
        string matric_number
        string identification_number
        string name
        enum gender
        string race
        string religion
        string email
        string phone
        timestamp submitted_at
        boolean is_submitted
        timestamp created_at
        timestamp updated_at
    }

    STUDENT_PREFERENCES {
        bigint id PK
        bigint student_id FK
        bigint registration_session_track_id FK
        integer priority
        timestamp created_at
        timestamp updated_at
    }

    PLACEMENTS {
        bigint id PK
        bigint student_id FK
        bigint assigned_class_id FK
        enum placement_status
        text placement_notes
        integer track_priority
        enum assigned_by
        bigint admin_id FK
        timestamp assigned_at
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    PLACEMENT_LOGS {
        bigint id PK
        bigint placement_id FK
        bigint registration_session_id FK
        bigint student_id FK
        bigint class_id FK
        bigint previous_class_id FK
        integer track_priority
        enum action
        bigint performed_by_user_id FK
        text notes
        json balance_metrics
        timestamp created_at
    }

    USERS {
        bigint id PK
        string name
        string email UK
        timestamp email_verified_at
        string password
        string remember_token
        timestamp created_at
        timestamp updated_at
    }

    RACES {
        bigint id PK
        string name
        string code UK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    RELIGIONS {
        bigint id PK
        string name
        string code UK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    ROLES {
        bigint id PK
        string name
        string guard_name
        timestamp created_at
        timestamp updated_at
    }

    PERMISSIONS {
        bigint id PK
        string name
        string guard_name
        timestamp created_at
        timestamp updated_at
    }
```

## Main Entities

| Table | Purpose |
| --- | --- |
| `registration_sessions` | Registration windows created by admins. Controls status, public registration, dates, and the unique registration link token. |
| `tracks` | Master track catalog, such as SAD, Networking, or Information Security. |
| `registration_session_tracks` | Tracks enabled for a specific registration session. Stores session-specific names and descriptions. |
| `classes` | Class groups under a session track. Holds quota, current count, and active state. |
| `students` | Student registration records for a session. Stores identity, demographics, contact details, and submission state. |
| `student_preferences` | Ranked student choices for session tracks. |
| `placements` | Current and historical placement decisions for students. The active placement is tracked with `is_active`. |
| `placement_logs` | Audit trail for automatic assignment, manual assignment, swaps, clears, and flagged records. |
| `users` | Admin and application user accounts. |
| `races` | Master list used by forms and management screens. Student records store the selected race as text. |
| `religions` | Master list used by forms and management screens. Student records store the selected religion as text. |

## Relationship Notes

- A registration session has many session tracks, students, and placement logs.
- A master track can be reused across many registration sessions through `registration_session_tracks`.
- A session track has many classes and can appear in many student preference records.
- A student belongs to one registration session and can have many ranked preferences.
- A student can have many placement rows over time, but only one active placement is intended.
- A placement may be assigned to a class or left unassigned when the student is pending or flagged.
- A placement may be created by the system or by an admin user.
- Placement logs denormalize the session, student, current class, previous class, action, notes, and balance metrics so placement changes remain auditable.
- `races` and `religions` are lookup/admin tables; there are no foreign keys from `students.race` or `students.religion`.
- Spatie permission tables connect users, roles, and permissions through polymorphic pivot tables. The diagram shows the logical user-role-permission relationship.

## Key Constraints

| Table | Constraint |
| --- | --- |
| `registration_sessions` | `link_token` is unique. |
| `students` | `(registration_session_id, matric_number)` is unique. |
| `students` | `(registration_session_id, identification_number)` is unique. |
| `student_preferences` | `(student_id, registration_session_track_id)` is unique. |
| `student_preferences` | `(student_id, priority)` is unique. |
| `placements` | `(student_id, is_active)` is unique. |
| `users` | `email` is unique. |
| `races` | `code` is unique. |
| `religions` | `code` is unique. |
| `roles` | `(name, guard_name)` is unique unless team support is enabled. |
| `permissions` | `(name, guard_name)` is unique. |

## Status And Enum Values

| Field | Values |
| --- | --- |
| `registration_sessions.status` | `draft`, `open`, `closed`, `placement`, `published` |
| `students.gender` | `male`, `female` |
| `placements.placement_status` | `pending`, `placed`, `flagged`, `manually_assigned` |
| `placements.assigned_by` | `system`, `admin` |
| `placement_logs.action` | `auto_assigned`, `manual_assigned`, `swapped`, `cleared`, `flagged` |

## Cascade And Null Behavior

| Relationship | Delete behavior |
| --- | --- |
| `registration_sessions` to `registration_session_tracks`, `students`, `placement_logs` | Cascade delete. |
| `tracks` to `registration_session_tracks` | Cascade delete. |
| `registration_session_tracks` to `classes`, `student_preferences` | Cascade delete. |
| `students` to `student_preferences`, `placements`, `placement_logs` | Cascade delete. |
| `placements.assigned_class_id` to `classes.id` | Set null when the class is deleted. |
| `placements.admin_id` to `users.id` | Set null when the user is deleted. |
| `placement_logs.class_id` and `placement_logs.previous_class_id` to `classes.id` | Set null when the class is deleted. |
| `placement_logs.performed_by_user_id` to `users.id` | Set null when the user is deleted. |

## Supporting Framework Tables

The application also includes Laravel and package support tables that are not part of the core placement domain:

- `password_reset_tokens`
- `sessions`
- `cache`
- `cache_locks`
- `jobs`
- `job_batches`
- `failed_jobs`
- `model_has_roles`
- `model_has_permissions`
- `role_has_permissions`
