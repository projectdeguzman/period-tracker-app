# Gut tracking manual test plan

## Preconditions
- Sign in as a valid user.
- Ensure `gut_tracking` migration has been applied.

## Scenarios

1. **Create cycle entry without gut tracking**
   - Open `/logs/cycle/new`.
   - Leave **Gut check** as `Skip for today`.
   - Save entry.
   - Confirm save succeeds and no errors show.
   - Confirm the new cycle entry renders normally in Home, Calendar, and details screens.

2. **Create cycle entry with gut tracking**
   - Open `/logs/cycle/new`.
   - Select a gut type (for example `smooth`).
   - Optionally choose effort and add notes.
   - Save entry.
   - Open that entry detail and confirm gut fields are displayed.

3. **Read cycle entry when gut tracking exists**
   - Open Calendar day view for the saved date.
   - Confirm cycle day card shows the gut check summary.
   - Open detail page and confirm poop type, effort, and gut notes render.

4. **Read cycle entry when gut tracking does not exist**
   - Open an entry created without gut tracking.
   - Confirm detail page shows `No gut check logged.`
   - Confirm no crash and normal cycle data still renders.

5. **Ownership / permissions expectations**
   - Attempt to query another user's `gut_tracking` rows using a different authenticated user.
   - Confirm RLS blocks select/update/delete/insert operations that violate `auth.uid() = user_id`.
