# ⚠️ Fix for "Safari cannot connect to server" (Localhost Error)

The error you are seeing on your iPhone (`localhost:3000`) happens because the Magic Link is trying to redirect to your computer's local address (`localhost`), which does not exist on your phone.

## How to Fix

### Option 1: Deploy to the Web (Recommended)
1. Deploy your app to **Vercel**, **Netlify**, or another host.
2. Go to your **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
3. Set **Site URL** to your new production URL (e.g., `https://optimal-protocol.vercel.app`).
4. Add the same URL to **Redirect URLs**.
5. Open the app on your phone using the **production URL**.

### Option 2: Test Locally on Wi-Fi
1. Find your computer's **Local IP Address** (e.g., `192.168.1.5`).
2. Go to **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
3. Add `http://<YOUR_IP>:5173` (e.g., `http://192.168.1.5:5173`) to **Redirect URLs**.
4. Open the app on your phone's browser using that IP: `http://192.168.1.5:5173`.
5. Login from the phone.

**Important:** You cannot click "Send Magic Link" on your computer and open it on your phone unless you are using a deployed URL.
