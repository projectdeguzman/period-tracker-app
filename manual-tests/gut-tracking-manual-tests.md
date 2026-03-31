# Gut tracking manual test plan

## Preconditions
- Sign in as a valid user.
- Ensure `gut_tracking` migration has been applied.

## Scenarios

1. **Dashboard access to gut form**
   - Open `/`.
   - Confirm **Quick actions** includes a `Gut Check` button.
   - Click it and confirm navigation to `/logs/cycle/new#gut-check`.

2. **Create cycle entry without gut tracking**
   - Open `/logs/cycle/new`.
   - Submit the `Log Period / Symptoms` card only.
   - Confirm save succeeds and cycle entry renders normally in Home, Calendar, and details.

3. **Create gut check independently**
   - Open `/logs/cycle/new#gut-check`.
   - In the standalone `Gut Check` card, choose a gut type.
   - Optionally choose effort and notes.
   - Submit and confirm `Gut check saved.` appears.

4. **Read cycle entry when gut tracking exists**
   - Create a cycle entry and gut check for the same date.
   - Confirm cycle cards/details show gut summary fields.

5. **Read cycle entry when gut tracking does not exist**
   - Open a cycle entry created with no gut check.
   - Confirm detail page shows `No gut check logged.`
   - Confirm no crash and normal cycle data still renders.

6. **Ownership / permissions expectations**
   - Attempt to query another user's `gut_tracking` rows using a different authenticated user.
   - Confirm RLS blocks select/update/delete/insert operations that violate `auth.uid() = user_id`.
