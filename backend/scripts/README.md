# SharePoint Migration Setup

## Authentication Issue
Your organization uses **MFA (Multi-Factor Authentication)** or **Conditional Access Policies**, which blocks simple Username/Password scripts.

## Solution: Use App-Only Authentication
You need to register an App in SharePoint/Azure AD to get a **Client ID** and **Client Secret**.

### Steps to get Client ID & Secret:
1.  **Navigate to App Registration**:
    - Go to your SharePoint site: `https://ukginc.sharepoint.com/teams/AIHubDev`
    - Append `/_layouts/15/appregnew.aspx` to the URL.
    - Full URL: `https://ukginc.sharepoint.com/teams/AIHubDev/_layouts/15/appregnew.aspx`
2.  **Create App**:
    - Click **Generate** for both Client Id and Client Secret.
    - Title: `AIHub Migration`
    - App Domain: `localhost`
    - Redirect URI: `https://localhost`
    - Click **Create**.
3.  **Grant Permissions**:
    - Go to `https://ukginc.sharepoint.com/teams/AIHubDev/_layouts/15/appinv.aspx`
    - Paste the **Client Id** you just created and click **Lookup**.
    - In the **Permission Request XML** box, paste this:
      ```xml
      <AppPermissionRequests AllowAppOnlyPolicy="true">
        <AppPermissionRequest Scope="http://sharepoint/content/sitecollection" Right="Read" />
      </AppPermissionRequests>
      ```
    - Click **Create**.
    - Click **Trust It** when prompted.
4.  **Update `.env`**:
    - Copy the Client ID and Client Secret to your `backend/.env` file:
      ```env
      SHAREPOINT_CLIENT_ID=your_new_client_id
      SHAREPOINT_CLIENT_SECRET=your_new_client_secret
      ```

## Running the Script
Once configured, run:
```bash
cd backend
python scripts/migrate_sharepoint.py
```
