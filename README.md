# 🥾 Ultra Together

> Train for your first ultra hike — together, without the guilt.

A free, static React SPA deployed on GitHub Pages. All data lives in Supabase (free tier). No server costs, ever.

---

## 🚀 Deploying to GitHub Pages (step-by-step)

### Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **New project**, give it a name, choose a region
3. Wait ~2 minutes for it to provision
4. Go to **Project Settings → API** and copy:
   - **Project URL** → you'll need this as `VITE_SUPABASE_URL`
   - **anon public** key → you'll need this as `VITE_SUPABASE_ANON_KEY`

### Step 2 — Set up the database

1. In your Supabase project, go to **SQL Editor**
2. Click **New query**
3. Open `supabase/migrations/001_initial_schema.sql` from this repo
4. Paste the entire contents and click **Run**

This creates all tables, enums, row-level security policies, and triggers.

### Step 3 — Configure Supabase Auth

1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to: `https://YOUR-USERNAME.github.io/ultra-together`
   - (replace `YOUR-USERNAME` with your GitHub username)
   - (replace `ultra-together` with your repo name if different)
3. Under **Redirect URLs**, add: `https://YOUR-USERNAME.github.io/ultra-together/**`
4. Go to **Authentication → Providers** → make sure **Email** is enabled

### Step 4 — Push the code to GitHub

```bash
# In this project folder:
git init
git add .
git commit -m "Initial commit"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR-USERNAME/ultra-together.git
git branch -M main
git push -u origin main
```

### Step 5 — Add secrets to GitHub

1. On GitHub, go to your repo → **Settings → Secrets and variables → Actions**
2. Under **Secrets**, click **New repository secret** and add:
   - Name: `VITE_SUPABASE_URL` / Value: your Supabase project URL
   - Name: `VITE_SUPABASE_ANON_KEY` / Value: your Supabase anon key
3. Under **Variables**, click **New repository variable** and add:
   - Name: `VITE_BASE_PATH` / Value: `/ultra-together/`
   *(Use your actual repo name with leading and trailing slashes)*

### Step 6 — Enable GitHub Pages

1. Go to your repo → **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. Click **Save**

### Step 7 — Trigger the deployment

The workflow runs automatically on every push to `main`. To trigger it manually:

1. Go to your repo → **Actions**
2. Click **Deploy to GitHub Pages**
3. Click **Run workflow → Run workflow**

After ~2 minutes, your app will be live at:
```
https://YOUR-USERNAME.github.io/ultra-together/
```

---

## 💻 Running locally

```bash
# 1. Install dependencies
npm install

# 2. Create local env file
cp .env.example .env.local
# Edit .env.local and add your Supabase URL and anon key

# 3. Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## 🗂 Project structure

```
ultra-together/
├── src/
│   ├── App.tsx                 # Router setup
│   ├── main.tsx                # Entry point
│   ├── index.css               # Tailwind + global styles
│   ├── hooks/
│   │   ├── useAuth.tsx         # Auth context (user, profile, couple, event)
│   │   ├── useSessions.ts      # Session data + log/delete helpers
│   │   ├── useGear.ts          # Gear data + add/retire helpers
│   │   ├── useMilestones.ts    # Milestone data
│   │   └── useToast.ts         # Toast notifications
│   ├── lib/
│   │   ├── supabase.ts         # Supabase browser client
│   │   └── utils.ts            # Formatters, helpers, constants
│   ├── types/
│   │   └── index.ts            # TypeScript domain types
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Invite.tsx          # Partner invite acceptance
│   │   ├── Dashboard.tsx
│   │   ├── Calendar.tsx
│   │   ├── Sessions.tsx
│   │   ├── Milestones.tsx
│   │   ├── Gear.tsx
│   │   ├── Partner.tsx
│   │   └── Settings.tsx
│   └── components/
│       ├── shared/             # AppLayout, TopNav, BottomNav
│       ├── sessions/           # LogSessionModal
│       └── ui/                 # Toaster
├── supabase/
│   ├── migrations/             # Database schema SQL
│   └── seed/                   # Example data SQL
├── public/
│   └── 404.html                # GitHub Pages SPA routing fix
├── .github/workflows/
│   └── deploy.yml              # Auto-deploy to Pages on push to main
├── .env.example
├── vite.config.ts
└── tailwind.config.ts
```

---

## 🔐 How auth works

- Users sign up / log in via Supabase Auth (email + password)
- Partners connect via a generated invite link (`/invite?token=…`)
- All data is scoped per couple via Row Level Security (RLS) in Postgres
- The browser client uses the anon key — RLS ensures users only see their own couple's data

---

## 🗄 Database

Full schema with RLS, triggers for auto-milestone detection, and gear km tracking is in `supabase/migrations/001_initial_schema.sql`.

Key tables: `profiles`, `couples`, `training_events`, `training_sessions`, `gear_items`, `milestones`, `childcare_plans`, `recovery_logs`

---

## 🗺 Roadmap

- [ ] PWA / offline mode  
- [ ] GPX import  
- [ ] Strava sync  
- [ ] Push notifications  
- [ ] Nutrition tracker  

---

*Built with ☕ and trail mix for parents who love big hills.*
