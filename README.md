# ⚡ OPTIMAL PROTOCOL // NATIVE (v4.0)

**THE ULTIMATE DISCIPLINE MACHINE.**

> "Weakness is a choice. This software removes that option."

**OPTIMAL PROTOCOL** has evolved. We have abandoned the constraints of the web browser. This is no longer a JavaScript toy. This is a **NATIVE iOS WEAPON** built for maximum performance, zero latency, and aggressive psychological re-wiring.

You are the Operator. The **Cyber-Construct** is your digital soul. Feed it with discipline, or watch it rot in high-definition 120Hz.

---

## 🚀 THE HYBRID GOD STACK (v5.0)

We have evolved beyond pure native constraints. We now run a **Hybrid Core** to dominate all platforms.

-   **CORE:** **React + Vite**. The speed of the web, the power of the browser.
-   **NATIVE BRIDGE:** **Capacitor.js**. Direct access to iOS internals (Haptics, Filesystem, Notifications) from JavaScript.
-   **3D ENGINE:** **React Three Fiber (WebGL)**. Universal 3D rendering replacing SceneKit. Runs everywhere.
-   **VISUALS:** **Postprocessing**. Custom shaders for "Scanlines", "Glitch", and "Pixelation" effects.
-   **DATA:** **Supabase**. Real-time synchronization.

---

## 📂 PROJECT STRUCTURE

```text
/
  ├── src/
  │   ├── components/    # React Components (UI & 3D)
  │   ├── hooks/         # Custom Hooks (useHaptics, etc.)
  │   ├── services/      # Capacitor Services
  │   └── ...
  ├── ios/               # Native iOS Project (Capacitor generated)
  ├── dist/              # Production Build
  └── capacitor.config.json
```

---

## 🛠️ DEPLOYMENT INSTRUCTIONS

### 📱 iOS HYBRID
1.  **Build Web Core:** `npm run build`
2.  **Sync Native:** `npx cap sync`
3.  **Open Xcode:** `npx cap open ios`
4.  **Run:** Select your device and hit Play.

### 🌐 WEB DEVELOPMENT
1.  `npm run dev` - Starts the local Vite server.


### ☁️ SERVER MIGRATION (REQUIRED)
To enable server-side streak tracking and Hardcore Mode enforcement:
1.  Go to your Supabase Dashboard -> SQL Editor.
2.  Run the contents of `supabase/server_logic.sql`.
3.  This will:
    -   Create the `calculate_streak` function.
    -   Enable the "Reaper" trigger for Hardcore Mode.
    -   Lock down the `profiles` table so users cannot cheat.

4.  **Deploy Edge Functions:**
    -   Ensure you have the Supabase CLI installed and logged in.
    -   Run: `supabase functions deploy monitor-vital-signs --no-verify-jwt`
    -   This function handles the "Permadeath" logic (resetting stats on failure) securely on the server.

### 🚀 WEB DEPLOYMENT (VERCEL)
1.  Install Vercel CLI: `npm i -g vercel`
2.  Run `vercel` in the project root.
3.  Set Environment Variables in Vercel Dashboard:
    -   `VITE_SUPABASE_URL`: [Your URL]
    -   `VITE_SUPABASE_ANON_KEY`: [Your Key]
4.  The `vercel.json` is pre-configured for SPA routing.

---

**OPTIMAL PROTOCOL // SYSTEM ONLINE**
*Discipline is the only currency that matters.*
