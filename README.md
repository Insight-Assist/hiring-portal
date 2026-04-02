# Insight Assist – Hiring Portal

A clean, professional hiring portal for the Remote Medical Scribe (Optometry) role.

**Built with:** React + Vite + Tailwind CSS + Supabase  
**Deployed via:** GitHub → Netlify  
**Design system:** Cormorant Garamond / DM Sans · Insight Assist brand palette

---

## What This Includes

**Candidate-facing:**
- Job posting page
- Multi-step application form (info + resume upload)
- Trial task (clinic scenario with 4 questions)
- Workplace Personality Assessment (20 questions, 4 types)
- Confirmation page

**Admin-facing (password protected):**
- Login screen (Supabase auth)
- Applicant dashboard with filters, search, and status overview
- Individual applicant detail page with:
  - All application responses
  - Resume link
  - Trial task scoring rubric (you enter scores manually per question)
  - Personality results with score bars
  - Internal notes
  - Status + recommendation fields

---

## First-Time Setup (Do This Once)

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **New Project** — name it `insight-hiring-portal`
3. Set a strong database password (save it somewhere safe)
4. Wait for the project to finish provisioning (~1 minute)

### Step 2: Run the Database Schema

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Paste the entire contents of `supabase-schema.sql` (in this repo)
3. Click **Run**
4. You should see: *Success. No rows returned.*

This creates:
- The `applications` table with all columns
- Row-level security policies (candidates can write, only you can read)
- The `resumes` storage bucket for resume file uploads

### Step 3: Get Your Supabase Keys

1. In Supabase, go to **Settings → API**
2. Copy:
   - **Project URL** (looks like: `https://xyzabc.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### Step 4: Create Your Admin User

1. In Supabase, go to **Authentication → Users**
2. Click **Add User → Create New User**
3. Enter your email (`kim@insight-assist.net`) and a strong password
4. This is your login for the admin dashboard

### Step 5: Set Up the GitHub Repo

1. Create a new repo on GitHub (name: `insight-hiring-portal`)
2. Push this project folder to it:

```bash
cd insight-hiring-portal
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/insight-hiring-portal.git
git push -u origin main
```

### Step 6: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) and log in
2. Click **Add New Site → Import from Git**
3. Choose GitHub, select your `insight-hiring-portal` repo
4. Build settings should auto-detect:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **Deploy Site**
6. Once deployed, go to **Site Settings → Environment Variables**
7. Add these two variables:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

8. Go to **Deploys** and click **Trigger Deploy → Deploy Site** to rebuild with the env vars

### Step 7: Set Your Custom Domain (Optional)

In Netlify → **Domain Settings**, add your domain and follow the DNS instructions.  
The `/admin` route is protected — only accessible with your Supabase login.

---

## Day-to-Day Usage

**To view applicants:**  
Go to `yoursite.com/admin/login` → sign in → dashboard loads

**To review an applicant:**  
Click **View →** on any row → opens their full detail page

**To score the trial task:**  
Each question has a score input in the admin detail view. Enter a number. The total (out of 100) updates automatically. Click **Save Changes**.

**To update status:**  
Use the **Status** dropdown on the applicant detail page. Click **Save Changes**.

**To add notes:**  
Type in the **Internal Notes** box and click **Save Changes**.

---

## Making Updates Later

Any change you push to GitHub will automatically redeploy on Netlify.

To edit content (job description, trial task, assessment questions):
- Job posting text → `src/pages/JobPosting.jsx`
- Trial task scenario + questions + rubric → `src/data/trialTask.js`
- Assessment questions → `src/data/assessment.js`
- Application form fields → `src/pages/Apply.jsx`

To add a second job posting in the future:
- Duplicate `JobPosting.jsx` with a new route
- Add a `role_id` column to the Supabase table
- Filter the admin dashboard by role

---

## Architecture Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Frontend | React + Vite | Fast, simple, GitHub-friendly |
| Styling | Tailwind CSS | No separate CSS files to maintain |
| Database | Supabase (Postgres) | Handles DB + storage + auth in one place |
| Auth | Supabase Auth | No extra service needed, built-in |
| Resume storage | Supabase Storage | Lives in same project as the DB |
| Hosting | Netlify | Connects directly to GitHub, free tier covers this |
| Backend | None needed | Supabase client SDK handles everything from the frontend |

**Why no Netlify Functions?**  
The Supabase client handles all reads/writes directly and securely via row-level security. No server needed.

**Why not Netlify Forms for resume uploads?**  
Netlify Forms doesn't support file upload storage in a way that's easy to retrieve from a dashboard. Supabase Storage gives you reliable file hosting with direct URLs.

---

## Environment Variables

| Variable | Where to Get It |
|----------|----------------|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |

Add both in Netlify → Site Settings → Environment Variables.  
For local dev, create a `.env` file (already in `.gitignore`):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## Local Development

```bash
npm install
# create .env with your Supabase keys
npm run dev
```

App runs at `http://localhost:5173`

---

## Suggested Next Improvements

1. **Email notification on new application** — use a Supabase Edge Function or Zapier trigger on the `applications` table insert to email you when someone applies
2. **Export to CSV** — add a button to download all applicants as a spreadsheet
3. **Multiple job postings** — add a `role_id` field and a job listings index page
4. **Candidate status email** — when you move someone to "Interview," trigger a notification email
5. **Resume preview in dashboard** — embed a PDF viewer on the applicant page instead of opening a new tab

---

*Insight Assist · insight-assist.net · Built with React + Supabase + Netlify*
