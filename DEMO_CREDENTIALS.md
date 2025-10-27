# Demo Credentials for Testing Multi-User Collaboration

To test the real-time collaborative editing features, use these two test accounts:

## Test User 1
- **Email:** alice@example.com
- **Password:** Alice123!@#
- **Name:** Alice Johnson

## Test User 2
- **Email:** bob@example.com
- **Password:** Bob123!@#
- **Name:** Bob Smith

## How to Test Collaboration

### Setup
1. Create a project (using either account)
2. Add both users as members to the same project
3. Create a page/task in that project

### Testing Steps

1. **Open Two Browser Windows**
   - Window 1: Login with Alice (alice@example.com)
   - Window 2: Login with Bob (bob@example.com)

2. **Navigate to Same Page**
   - Both users should navigate to the same documentation page
   - You should see "Editing with: [Other User Name]" indicator

3. **Test Cursor Tracking**
   - In Window 1 (Alice), click in the editor and position cursor
   - In Window 2 (Bob), you should see Alice's cursor position with her name
   - Move Alice's cursor around - Bob should see it update in real-time

4. **Test Content Synchronization**
   - In Window 1, type some content
   - In Window 2, you should see the changes appear automatically
   - Try editing at the same time to test conflict resolution

5. **Test Task Management**
   - Navigate to the Board view
   - Create a task as Alice
   - You should see it appear in Bob's view in real-time
   - Try dragging tasks between columns simultaneously

### Features to Test

✅ Real-time cursor positions  
✅ Live content updates  
✅ User presence indicators  
✅ Collaborative editing without conflicts  
✅ Task creation and updates  
✅ Simultaneous edits  

## Troubleshooting

If collaboration features aren't working:

1. **Check Supabase Realtime is enabled**
   - Go to Supabase Dashboard > Project Settings > Realtime
   - Ensure realtime is enabled for the database

2. **Check RLS Policies**
   - Make sure the RLS policies were applied
   - Both users need to be members of the same project

3. **Check Browser Console**
   - Look for any errors in the browser developer console
   - Check Network tab to see if realtime events are being sent

4. **Clear Local Storage**
   - Clear browser cache and local storage
   - Log out and log back in

## Creating More Test Users

To create additional test users:

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Create a new user"
3. Enter email and password
4. Make sure to add them to projects as members

## Production Notes

⚠️ These credentials are for **development/testing only**  
⚠️ Change all credentials before deploying to production  
⚠️ Implement proper authentication and user management  
⚠️ Use environment variables for sensitive data
