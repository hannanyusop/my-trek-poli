# My Trek Poli

Welcome to My Trek Poli - a Laravel application built with React and Inertia.js.

## Tech Stack

- **Backend**: Laravel 12 (PHP 8.3.23)
- **Frontend**: React 19 with Inertia.js v2
- **Styling**: Tailwind CSS v4
- **Testing**: Pest v4
- **Code Style**: Laravel Pint

## Quick Start

### Development
```bash
# Start the development server
php artisan serve --host=0.0.0.0 --port=8080
```

### Testing
```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/ExampleTest.php

# Run tests with filter
php artisan test --filter=testName
```

### Code Formatting
```bash
# Format code with Pint
vendor/bin/pint --dirty
```

## Project Structure

- `app/` - Laravel application code
- `resources/js/Pages/` - Inertia.js React components
- `tests/` - Pest test files
- `docs/` - Project documentation

## Getting Started

1. Install dependencies: `composer install && npm install`
2. Copy environment file: `cp .env.example .env`
3. Generate app key: `php artisan key:generate`
4. Run migrations: `php artisan migrate`
5. Start development: `npm run dev`

## Registration Session Flow

The registration session follows a lifecycle with specific statuses that control student access and system behavior.

### Status Flow Diagram

```
┌─────────┐                    ┌──────┐    closeSession()    ┌────────┐
│  Draft  │ ─────────────────► │ Open │ ──────────────────► │ Closed │
└─────────┘   (manual/admin)   └──────┘                      └────────┘
                                                                  │
                                                        startPlacement()
                                                                  ▼
┌───────────┐  publishResults()  ┌───────────┐    Job Done   ┌────────────┐
│ Published │ ◄───────────────── │ Placement │ ◄──────────── │ Processing │
└───────────┘                    └───────────┘               └────────────┘
```

### Status Definitions

| Status | Description | Student Access |
|--------|-------------|----------------|
| **Draft** | Session created but not yet open for registration | No access - "Registration Not Yet Open" message |
| **Open** | Active registration period | Full access - can register and submit preferences |
| **Closed** | Registration period ended | No access - "Registration Closed" message |
| **Processing** | System is running placement algorithm | No access - "Processing in Progress" message |
| **Placement** | Placements completed, under admin review | No access - "Placements Under Review" message |
| **Published** | Results are available | View only - can see assigned class placement |

### Student Registration Flow

1. **Access Registration URL**: Student visits `/register/{token}`
2. **Enter Matric Number**: Student enters their matric number to lookup their record
3. **Fill Personal Info**: Student completes/verifies personal information
4. **Select Track Preferences**: Student ranks their track preferences in order
5. **Preview & Submit**: Student reviews and submits their registration
6. **View Results**: After status becomes "Published", student can view their class assignment

### Admin Actions

| Action | Route | Status Transition |
|--------|-------|-------------------|
| Create Session | `POST /admin/registration-sessions` | → Draft |
| Open Session | `POST /{id}/open` | Draft → Open |
| Close Session | `POST /{id}/close` | Open → Closed |
| Start Placement | `POST /{id}/start-placement` | Closed → Processing |
| (Job Completes) | (automatic) | Processing → Placement |
| Publish Results | `POST /{id}/publish` | Placement → Published |

### Key Models

- `RegistrationSession` - Main session with status, dates, and link token
- `RegistrationSessionTrack` - Tracks available in a session
- `Student` - Student records linked to a session
- `StudentPreference` - Student's ranked track preferences
- `Placement` - Final class assignments after processing
- `Classes` - Available classes within tracks

## Placement Algorithm

The placement system automatically assigns students to classes based on their track preferences while maintaining balance across multiple dimensions.

### Algorithm Overview

**Processing Order**: First-Come-First-Served (FCFS) based on `submitted_at` timestamp.

**Balancing Factors**:
1. **Class Size Balance** - Distributes students evenly across all classes (all tracks)
2. **Gender Balance** - Maintains gender proportions matching overall population
3. **Race Balance** - Maintains race proportions matching overall population

### Algorithm Flow

```
1. INITIALIZATION
   ├── Fetch all submitted students (ordered by submission time)
   ├── Calculate target proportions (gender/race from total population)
   ├── Calculate ideal class size (total students ÷ total classes)
   └── Initialize class distribution tracking

2. FOR EACH STUDENT (FCFS order)
   │
   ├── FOR EACH PREFERENCE (priority 1 → 2 → 3)
   │   ├── Get available classes for track (where count < quota)
   │   ├── Calculate balance score for each class
   │   ├── Select class with LOWEST score (best balance)
   │   └── If assigned → move to next student
   │
   └── IF all preferences exhausted → FLAG for manual review

3. BALANCE SCORE CALCULATION
   │
   ├── Class Size Score (40% weight)
   │   └── Deviation from ideal class size across all tracks
   │
   ├── Gender Score (30% weight)
   │   └── Deviation from target gender proportion
   │
   └── Race Score (30% weight)
       └── Deviation from target race proportion

   Final Score = (size_deviation × 0.4) + (gender_deviation × 0.3) + (race_deviation × 0.3)
   Lower score = Better balance
```

### Balance Score Example

```
Scenario:
- Total students: 120
- Total classes: 6 (2 per track)
- Ideal class size: 20 students each
- Target demographics: 60% Male, 70% Race A

Class 1 (Track A): 25 students, 80% Male, 75% Race A
Class 2 (Track A): 15 students, 55% Male, 68% Race A

When assigning a Male, Race A student to Track A:

Class 1 Score:
- Size deviation: |25 - 20| / 20 = 0.25 (5 over ideal)
- Gender deviation: |0.80 - 0.60| = 0.20
- Race deviation: |0.75 - 0.70| = 0.05
- Final: (0.25 × 0.4) + (0.20 × 0.3) + (0.05 × 0.3) = 0.175

Class 2 Score:
- Size deviation: |15 - 20| / 20 = 0.25 (5 under ideal)
- Gender deviation: |0.55 - 0.60| = 0.05
- Race deviation: |0.68 - 0.70| = 0.02
- Final: (0.25 × 0.4) + (0.05 × 0.3) + (0.02 × 0.3) = 0.121

→ Student assigned to Class 2 (lower score = better balance)
```

### Placement Statuses

| Status | Description |
|--------|-------------|
| `pending` | Not yet processed |
| `placed` | Auto-assigned by system |
| `flagged` | All preferences exhausted, needs manual review |
| `manually_assigned` | Admin manually reassigned |

### Key Files

| Component | Location |
|-----------|----------|
| Core Algorithm | `app/Services/PlacementService.php` |
| Queued Job | `app/Jobs/ProcessPlacementJob.php` |
| Admin Controller | `app/Http/Controllers/Admin/PlacementController.php` |
| Models | `app/Models/Placement.php`, `PlacementLog.php` |
| Admin UI | `resources/js/Pages/Admin/RegistrationSessions/Placement.tsx` |

## Contributing

Follow the Laravel Boost guidelines defined in `CLAUDE.md` for consistent code style and best practices.
