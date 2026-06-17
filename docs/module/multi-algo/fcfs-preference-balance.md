# FCFS Preference Balance Algorithm

## Algorithm Key

```text
fcfs_preference_balance
```

## Purpose

This algorithm places students by registration order while respecting their ranked track choices as much as possible.

The main rule is:

1. The student who submits first is processed first.
2. The system tries to place that student into their first choice.
3. If the first choice has no available class capacity, the system tries the second choice.
4. If the second choice is also full, the system tries the third choice.
5. If none of the student's choices has capacity, the student is flagged for manual review.

Within the selected choice, the system still balances gender and race across classes.

## Inputs

The algorithm uses:

- Submitted students in the registration session.
- Student preferences ordered by `priority` ascending.
- Active classes under each preferred `registration_session_track`.
- Class quota.
- Student gender.
- Student race.

## Processing Order

Students are processed first-come-first-served:

```text
submitted_at ascending
```

If two students have the same submission time, database ID order is used as a stable tie-breaker.

## Placement Flow

For each submitted student:

1. Load preferences ordered by priority.
2. Check priority 1.
3. Get active classes under that preferred track.
4. Remove classes that are already at quota.
5. If classes are available, choose the best class by balance score and place the student.
6. If no class is available, repeat the same check for priority 2.
7. If priority 2 is full, repeat for priority 3.
8. If all choices are full or missing, flag the student.

## Class Balance Rule

When a preferred track has more than one available class, the system does not simply pick the first class.

It calculates a balance score for every available class and chooses the lowest score.

The score considers:

- Class size balance.
- Gender balance.
- Race balance.

This keeps classes under the same preferred track as balanced as possible while still honoring FCFS and student choices.

## Example

Setup:

- Track A has Class A1 and Class A2.
- Track B has Class B1.
- Track C has Class C1.
- Student 1 submitted before Student 2.

Student 1 choices:

```text
1. Track A
2. Track B
3. Track C
```

If Track A has capacity, Student 1 gets Track A. The system chooses either Class A1 or Class A2 based on balance.

If all Track A classes are full, Student 1 is checked against Track B.

If Track B is also full, Student 1 is checked against Track C.

If Track C is full too, Student 1 is flagged.

Only after Student 1 is placed or flagged does the system process Student 2.

## Important Behavior

- A later student cannot take a first-choice slot before an earlier submitted student is processed.
- The algorithm only moves to the next preference when the current preferred track has no active class with capacity.
- Gender and race balance are applied when choosing between available classes inside the same preferred track.
- The algorithm does not search outside the student's listed preferences.
- Quota is always respected.

## Flagged Cases

A student is flagged when:

- They have no saved preferences.
- Their preferences point to unavailable session tracks.
- All classes under all preferred tracks are full.
- No suitable class can be found.

