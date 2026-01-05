# Placement Service Documentation

## Overview

The `PlacementService` is responsible for automatically assigning students to classes within a registration session. It uses a **global balance algorithm** that distributes students across all available classes while maintaining demographic diversity.

## Key Concepts

### Processing Order: First-Come-First-Served (FCFS)

Students are processed in the order they submitted their registration, determined by the `submitted_at` timestamp. This ensures fairness based on submission time.

```php
$students = Student::where('registration_session_id', $sessionId)
    ->where('is_submitted', true)
    ->orderBy('submitted_at', 'asc')
    ->get();
```

### Global Class Selection

Unlike preference-based placement, this algorithm considers **all active classes** in the session, not just the student's preferred tracks. The system selects the best class globally based on a balance score.

## The Placement Algorithm

### Step 1: Calculate Target Proportions

Before placing any students, the system calculates the demographic proportions of the entire student population:

- **Gender proportions**: e.g., if 60% male and 40% female in the pool
- **Race proportions**: e.g., if 50% Malay, 30% Chinese, 15% Indian, 5% Others

These proportions become the target for each class to maintain balanced diversity.

### Step 2: Calculate Ideal Class Sizes

The algorithm calculates an ideal size for each class based on:

1. Total number of students
2. Number of available classes
3. Each class's quota limit

**Example:**
- 100 students, 4 classes with quotas [30, 30, 30, 20]
- Initial ideal: 100 ÷ 4 = 25 per class
- Class D (quota 20) is capped → gets 20 students
- Remaining: 80 students for 3 classes ≈ 27 each
- Final distribution: A=27, B=27, C=26, D=20

### Step 3: Process Each Student

For each student (in FCFS order):

1. **Get available classes**: All active classes with remaining capacity
2. **Calculate balance score** for each class
3. **Assign to best class**: The class with the lowest (best) score

### Step 4: Balance Score Calculation

The balance score determines which class is the best fit. **Lower scores are better.**

```
Score = (Size Deviation × 0.70) + (Gender Deviation × 0.15) + (Race Deviation × 0.15)
```

#### Component Weights:

| Factor | Weight | Purpose |
|--------|--------|---------|
| Class Size | 70% | Ensures even distribution across classes |
| Gender | 15% | Maintains gender balance in each class |
| Race | 15% | Maintains racial diversity in each class |

#### Size Deviation

Measures how far a class is from its ideal size:

```
normalizedDeviation = (currentCount - idealSize) / idealSize
```

- Classes below their ideal get negative (better) scores
- Classes above their ideal get positive (worse) scores
- Empty classes get strongly preferred (bonus for filling empty classes first)

#### Gender/Race Deviation

Measures how far the projected proportion differs from the target:

```
deviation = |projectedProportion - targetProportion|
```

If adding a male student would make a class 70% male (when target is 60%), the deviation is 0.10.

## Placement Outcomes

### Placed

A student is successfully assigned when:
- At least one class has available capacity
- A class is found with acceptable balance score

The placement record includes:
- `placement_status`: "placed"
- `track_priority`: The student's preference priority (if the assigned track was in their preferences)
- `assigned_by`: "system"

### Flagged

A student is flagged for manual review when:
- No classes have available capacity
- No suitable class could be found

The placement record includes:
- `placement_status`: "flagged"
- `placement_notes`: Reason for flagging
- `assigned_class_id`: null

## Example Scenario

**Setup:**
- 3 Tracks: Science (2 classes), Arts (1 class), Commerce (1 class)
- Each class quota: 25 students
- Total students: 80

**Ideal distribution:**
- Science A: 20, Science B: 20, Arts: 20, Commerce: 20

**Student Processing:**
1. Student 1 (Male, Malay) → Placed in Science A (empty class, lowest score)
2. Student 2 (Female, Chinese) → Placed in Science B (empty class preferred)
3. Student 3 (Male, Malay) → Placed in Arts (empty class preferred)
4. Student 4 (Female, Indian) → Placed in Commerce (empty class preferred)
5. Student 5 (Male, Malay) → Placed in Science A (needs more students, good gender balance)
6. ...continues until all students placed

## Session Management

### Regenerate Placements

```php
$service->regenerateSession($sessionId);
```

This clears all existing placements and re-runs the algorithm. Useful when:
- New students have submitted after initial placement
- Class configurations have changed
- You want a fresh distribution

### Clear Placements

```php
$service->clearSessionPlacements($sessionId);
```

Removes all active placements for a session without re-running the algorithm.

## Progress Tracking

The service provides real-time progress via cache:

```php
$progress = $service->getProgress($sessionId);
// Returns: ['processed' => 50, 'total' => 100, 'percentage' => 50.0, 'flagged' => 2]
```

## Database Records

### Placements Table

Each placement creates a record with:
- `student_id`: The student being placed
- `assigned_class_id`: The class assigned (null if flagged)
- `placement_status`: "placed" or "flagged"
- `track_priority`: Student's preference priority for this track
- `is_active`: Only one active placement per student

### Placement Logs Table

Every placement action is logged with:
- `action`: "auto_assigned" or "flagged"
- `balance_metrics`: Snapshot of class distribution at time of placement
- `notes`: Human-readable description

## Key Considerations

1. **No Student Preferences Used**: The algorithm ignores student track preferences when selecting classes. It optimizes for global balance only.

2. **Track Priority is Informational**: The `track_priority` field records whether the assigned track matched any of the student's preferences, but doesn't influence placement decisions.

3. **Quota Limits are Respected**: A class will never exceed its quota, even if it would create imbalance.

4. **Deterministic Results**: Given the same input data and same submission order, the algorithm produces identical results.