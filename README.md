# ⚡ OPTIMAL PROTOCOL // VISUAL OVERHAUL (v3.0)

**THE WORLD'S FIRST LIVING HABIT PROTOCOL.**

> "Most apps just track data. This one builds your digital legacy."

**OPTIMAL PROTOCOL** is not a checklist. It is a **Cybernetic Life Simulator** linked directly to your daily discipline. You are the Operator. The **Cyber-Construct** is your digital twin. If you slack off, it glitches and decays. If you dominate, it evolves into a **GODLIKE** state.

**v3.0 UPDATE:** We have abandoned abstract geometry for a raw, **Retro FPS (Doom/Quake)** aesthetic.

---

## 💀 HARDCORE MODE (PERMADEATH)

**⚠️ WARNING: NOT FOR CIVILIANS.**

- **The Stakes:** If you miss **ONE DAY**, your entire Streak and Level are **WIPED**.
- **Visual Override:** The interface shifts to a gritty, blood-red theme with **Gothic Typography (Pirata One)** and analog noise interference.
- **Audio Feedback:** Heavy industrial sounds and alarms.

---

## 🤖 THE AVATAR SYSTEM (v3.0)

Your twin is no longer a sphere. It is a **Procedural Retro-FPS Sprite** that physically transforms based on your discipline.

### 1. 🧬 EVOLUTIONARY STAGES
- **💀 STAGE 0: WITHERED (Low Integrity)**
  - A skeleton or emaciated form.
  - Environment: **Dirty Dungeon**. Dark, dusty, red emergency lighting.
- **👤 STAGE 1: OPERATIVE (Normal)**
  - Base human musculature. Ready for combat.
  - Environment: **Standard Quarters**. Neutral lighting.
- **🦾 STAGE 2: GODLIKE (50+ Streak)**
  - Full Cyborg Augmentation. Golden armor, neon veins.
  - Environment: **High-Tech Laboratory**. Clean, cold, clinical perfection.

### 2. 🎭 VISUAL MODES
The avatar changes appearance based on your selected protocol mode:

#### 🛡️ SAFE MODE
- **Normal:** **Doom Marine**. Classic military green armor, human skin.
- **God Mode:** **Golden Saint**. Polished gold armor, glowing white skin, cyan energy.

#### ☠️ DEATH MODE
- **Normal:** **Cyber-Necromancer**. Dark navy/purple armor, necrotic grey/red skin, neon red edges.
- **God Mode:** **THE VOID WALKER**. Vantablack armor, dark matter skin, blinding white singularity core, purple event horizon particles.

### 3. 📺 PS1/RETRO ENGINE
- **Stop-Motion Animation:** Character animates at 12 FPS for that crunchy 90s feel.
- **Pixelation Shader:** The entire 3D scene is downsampled to mimic 320x240 resolution.
- **No Anti-Aliasing:** Raw, jagged edges for maximum retro authenticity.
- **CRT Effects:** Scanlines, noise, and chromatic aberration.

---

## 🖥️ TACTICAL INTERFACE

### 1. 🔋 DYNAMIC TYPOGRAPHY
- **Safe Mode:** Uses **'Unbounded'** – a wide, aggressive modern sans-serif.
- **Hardcore Mode:** Shifts to **'Pirata One'** – a sharp, medieval blackletter font.

### 2. 🏆 VIRAL IDENTITY SYSTEM
- **Tactical Share Card:** A futuristic diagnostic report designed for Instagram Stories (9:16).
- **Proof of Work:** One-click generation of a visual overlay to prove your daily completion.

---

## 🛠️ TECH STACK

Built with the bleeding edge of web technology:
- **React 19** - The Neural Network
- **Three.js / React Three Fiber** - The 3D Engine
- **Post-Processing** - Pixelation, Bloom, Glitch, Noise
- **Framer Motion** - The Physics Engine
- **Vite** - Hypersonic Build Speeds

---

## 🚀 INITIALIZE PROTOCOL

```bash
# Install Dependencies
npm install

# Engage Systems (Dev)
npm run dev

# Compile Production Build
npm run build
```

---

**OPTIMAL PROTOCOL // SYSTEM ONLINE**
*Initialize Your Twin. Achieve God Mode.*

---

## ☁️ BACKEND & AUTH (SUPABASE)

The application uses **Supabase** for data persistence and authentication.

### Setup
1. Create a Supabase project.
2. Run the SQL script in `supabase/schema.sql` in your Supabase SQL Editor to set up tables and policies.
3. Configure Authentication (Email/Magic Link, Google, Apple).
4. Set environment variables in `.env` (see `.env.example`).

### 📱 MOBILE LOGIN TROUBLESHOOTING (LOCALHOST)

If you are testing on a mobile device via local network (PWA/Safari):

1. **Network Access:** Ensure you run `npm run dev -- --host`.
2. **Redirect URL:** Add your computer's Network IP (e.g., `http://192.168.0.x:5174`) to Supabase **Redirect URLs**.
3. **Manual Entry (Fallback):**
   - If the Magic Link fails to open the app on mobile (common with localhost/http), copy the link from the email.
   - Paste it into the **"Paste link here"** field on the login screen.
   - Click the link icon to log in manually.
