# Today Cycle Card Manual Tests

These tests verify the manual cycle-tracking and prediction behavior that drives the homepage Today card.

## Preconditions

- Use a signed-in account.
- Make sure Supabase schema is already applied.
- Run the app locally with `npm run dev`.
- Use the cycle logging form to create entries in the order shown below.

## Test 1: No Period History

Steps:
1. Sign in with an account that has no cycle entries.
2. Open the homepage.

Expected:
- The Today card shows `Ready to start tracking?`
- The supporting copy says `Log your next period start to begin.`
- The CTA says `Log Period Start`

## Test 2: Period In Progress

Steps:
1. Create a cycle entry with `Log type = Period started`.
2. Return to the homepage.

Expected:
- The Today card shows `Period in progress`
- The card shows `Day 1` if the start date is today
- The CTA says `Log Period End`

## Test 3: Between Cycles, No Prediction Yet

Steps:
1. Create a `Period ended` entry after the period start.
2. Make sure the account still has fewer than 3 total `Period started` entries.
3. Return to the homepage.

Expected:
- The Today card no longer shows `Period in progress`
- The card shows `Cycle in progress`
- The body says `Keep tracking symptoms and future period starts to unlock predictions.`
- The CTA says `Log symptoms`
- The `Next Period` summary card shows `N/A`

## Test 4: Prediction Unlocks After Enough History

Use this sample history:

- `2026-01-01` -> `Period started`
- `2026-01-05` -> `Period ended`
- `2026-01-30` -> `Period started`
- `2026-02-03` -> `Period ended`
- `2026-02-28` -> `Period started`
- `2026-03-04` -> `Period ended`

Steps:
1. Log the entries above in order.
2. Return to the homepage.

Expected:
- The `Next Period` summary card no longer shows `N/A`
- The helper text about needing more period starts no longer appears
- The Today card shows `Cycle in progress`
- The Today card includes `Next period expected around ...`
- The CTA says `Log symptoms`

## Test 5: Predicted Start Window

Goal:
- Verify the `Log Period Start` CTA returns during the predicted window.

Steps:
1. Use cycle-history dates that make the predicted next period fall within:
   - one day before today
   - today
   - one day after today
2. Open the homepage.

Expected:
- The Today card says `Your period may start soon`
- The card says `Expected around ...`
- The CTA says `Log Period Start`

## Test 6: Late For Period

Goal:
- Verify the app handles missed prediction windows gracefully.

Steps:
1. Use cycle-history dates that make the predicted next period more than 1 day in the past.
2. Do not log a new `Period started` entry.
3. Open the homepage.

Expected:
- The Today card says `Waiting for your next period`
- The body mentions that cycles can shift
- The CTA says `Log Period Start`

## Test 7: Logging A New Period Start Resets The State

Steps:
1. From either the `Your period may start soon` or `Waiting for your next period` state, click `Log Period Start`.
2. Save a new `Period started` entry.
3. Return to the homepage.

Expected:
- The Today card returns to `Period in progress`
- The day count resets based on the newly logged start
- The CTA changes to `Log Period End`

## Test 8: CTA Default Log Type

Steps:
1. From the Today card `Log Period Start` CTA, open the cycle form.
2. Observe the selected log type.
3. From the Today card `Log Period End` CTA, open the cycle form.
4. Observe the selected log type.
5. From the homepage `Log Period / Symptoms` quick action, open the cycle form.
6. Observe the selected log type.

Expected:
- `Log Period Start` opens the form with `Period started` selected
- `Log Period End` opens the form with `Period ended` selected
- `Log Period / Symptoms` opens the form with `Symptoms` selected

## Test 9: Calendar And Detail Consistency

Steps:
1. Open the calendar after creating several cycle entries.
2. Select a day that contains cycle entries.
3. Open a cycle detail page from the homepage list.

Expected:
- The calendar still highlights cycle days correctly
- Day details still show the correct cycle entries
- The cycle detail page still loads the correct entry

## Test 10: Refresh And Re-Login Persistence

Steps:
1. Create or update cycle entries.
2. Refresh the homepage.
3. Sign out and sign back in.

Expected:
- The same cycle data remains visible
- The Today card state remains consistent with the saved cycle history
- The summary cards and calendar still match the saved data
