# Multi Placement Algorithm Module

## Purpose

Registration sessions currently use one hard-coded placement strategy in `PlacementService`: global class balancing by class size, gender, and race.

This module introduces a session-level `placement_algorithm` setting so each `registration_sessions` record can choose which algorithm should be used when placements are generated or regenerated.

## Recommended Database Change

Add a new column to `registration_sessions`:

```php
$table->string('placement_algorithm')->default('global_balance');
```

Recommended migration behavior:

- Add the column after `enable_public_registration` if that column exists in the target database.
- Use a default value so existing sessions continue to work without manual data migration.
- Keep the value as a string instead of an enum column so new algorithms can be added without database enum changes.
- Validate accepted values in Laravel code using an enum or centralized registry.

Recommended model updates:

- Add `placement_algorithm` to `RegistrationSession::$fillable`.
- Keep it cast as a plain string, or cast to a PHP enum if an enum is introduced.

## Initial Algorithm Key

The existing behavior should be preserved under this key:

```text
global_balance
```

Meaning:

- Processes submitted students by `submitted_at` ascending.
- Considers all active classes in the session.
- Respects class quota.
- Scores candidate classes by size, gender, and race balance.
- Ignores student track preferences when choosing a class.
- Stores preference priority only as informational placement metadata.

## Future Algorithm Keys

New algorithms should be added as stable lowercase keys:

```text
global_balance
fcfs_preference_balance
quota_fill
manual_review
```

The final list can change when the exact algorithms are provided. Once a key is used in production data, avoid renaming it. Add a new key instead.

## Service Design

Avoid growing one large `PlacementService` with many `if` branches. Use a small strategy contract and route the selected session algorithm to the correct implementation.

Suggested contract:

```php
interface PlacementAlgorithm
{
    public function key(): string;

    public function process(RegistrationSession $session): array;
}
```

Suggested structure:

```text
app/
  Placement/
    Algorithms/
      GlobalBalancePlacementAlgorithm.php
      PreferenceFirstPlacementAlgorithm.php
    PlacementAlgorithm.php
    PlacementAlgorithmRegistry.php
```

`PlacementService` remains the orchestration entry point used by controllers and jobs:

```php
$session = RegistrationSession::findOrFail($sessionId);
$algorithm = $registry->for($session->placement_algorithm);

return $algorithm->process($session);
```

## Controller And UI Changes

Create/edit registration session forms should include `placement_algorithm`.

Validation should use the centralized algorithm registry:

```php
'placement_algorithm' => ['required', Rule::in($algorithmRegistry->keys())],
```

The create form should default to `global_balance` unless an admin selects another algorithm.

The session detail page should show the selected algorithm because regeneration will use that value.

## Placement Regeneration Behavior

Regeneration must use the algorithm saved on the session, not a request parameter. This makes results auditable and prevents a session from silently changing behavior between initial placement and regeneration.

If admins need to change the algorithm after placements already exist, recommended behavior is:

- Allow the algorithm to be edited only before placement starts, or
- Require an explicit confirmation that existing placements must be cleared and regenerated.

## Logging And Audit

Placement logs should record which algorithm was used.

Recommended lightweight option:

- Include `algorithm` inside `placement_logs.balance_metrics` for automatic assignments.
- Include `algorithm` in `notes` for flagged or cleared actions until a dedicated column is needed.

Future dedicated column if reporting needs grow:

```php
$table->string('placement_algorithm')->nullable();
```

on `placement_logs`.

## Concerns

1. Backward compatibility

   Existing sessions need a default value. Use `global_balance` so the current behavior is unchanged.

2. Algorithm key stability

   Do not store display names such as "Global Balance Algorithm" in the database. Store stable keys and map them to labels in code.

3. Result reproducibility

   Each algorithm must define ordering rules and tie-breakers. If two classes have the same score, the implementation should use a stable fallback such as class ID.

4. Validation drift

   Backend validation, frontend options, and service dispatch must use the same source of truth. Prefer a PHP enum or registry exposed to Inertia.

5. Mixed placement behavior

   A session should have one active algorithm for a placement run. Avoid mixing algorithms within one session unless a future requirement explicitly needs per-student or per-track algorithms.

6. Existing `PlacementService` state

   The current service stores counters and distributions as instance properties. When converting to strategies, each algorithm should reset its own run state at the start of processing.

7. Tests

   Add coverage for:

   - Existing sessions defaulting to `global_balance`.
   - Creating a session with a selected algorithm.
   - Placement job dispatching to the selected algorithm.
   - Regeneration using the saved session algorithm.
   - Invalid algorithm values being rejected.

## Implementation Steps

1. Add `placement_algorithm` migration with default `global_balance`.
2. Update `RegistrationSession` fillable fields.
3. Add a `PlacementAlgorithmKey` enum or `PlacementAlgorithmRegistry`.
4. Move current `PlacementService` algorithm internals into `GlobalBalancePlacementAlgorithm`.
5. Keep `PlacementService` as the public entry point and delegate to the registry.
6. Update create/edit validation and Inertia props.
7. Add frontend selection control in the registration session form.
8. Add tests for default behavior and selected algorithm dispatch.

## Implemented Algorithms

| Key | Name | Documentation |
|-----|------|---------------|
| `global_balance` | Global Balance | Existing `PlacementService` behavior. |
| `fcfs_preference_balance` | FCFS Preference Balance | [fcfs-preference-balance.md](fcfs-preference-balance.md) |
