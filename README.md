# 📌 Smart Bookmark App

A fast, private bookmark manager built with Next.js, Supabase, and Tailwind CSS.

## Live Demo
[Deployed on Vercel](#) ← replace with your URL

## GitHub Repo
[github.com/sahityasami27/smart-bookmark-app](https://github.com/sahityasami27/smart-bookmark-app)

---

## Features
- Google OAuth only (no email/password)
- Add and delete bookmarks (title + URL)
- Bookmarks are private to each user via Row Level Security
- Real-time updates across tabs using Supabase Realtime
- Deployed on Vercel

## Tech Stack
- Next.js 15 (App Router)
- Supabase (Auth, Database, Realtime)
- Tailwind CSS
- @supabase/ssr

---

## Problems I Ran Into & How I Solved Them

### 1. `@supabase/auth-helpers-nextjs` was deprecated
When setting up the auth callback route, I tried using `@supabase/auth-helpers-nextjs` which is the package most tutorials reference. It turned out this package is no longer supported. I switched to `@supabase/ssr`, which is the current officially recommended package for Next.js and Supabase integration.

### 2. `cookies()` must be awaited in Next.js 15
After switching to `@supabase/ssr`, I got an error saying `cookies() returns a Promise and must be unwrapped with await`. This is because Next.js 15 made the `cookies()` function asynchronous. The fix was simple — adding `await` before `cookies()` in the server client:
```js
const cookieStore = await cookies()
```

### 3. Auth callback returning 404
After clicking "Continue with Google", the app was redirecting to `/auth/callback` but returning a 404. This route didn't exist. I had to create `app/auth/callback/route.js` as a Next.js Route Handler that exchanges the OAuth code for a Supabase session.

### 4. Pasted `.env` values into the wrong file
While setting up environment variables, I accidentally pasted the Supabase URL and anon key directly into `route.js` instead of `.env.local`. This caused a JavaScript parse error. The fix was to create a separate `.env.local` file in the project root with the correct format.

### 5. Wrong folder structure for Supabase clients
I created `lib/client.js` and `lib/server.js` directly inside `lib/` but the imports expected them at `lib/supabase/client.js` and `lib/supabase/server.js`. Moving the files into a `supabase/` subfolder inside `lib/` resolved the module not found errors.

### 6. Old `page.js` still importing deleted `supabaseClient.js`
After deleting the old `lib/supabaseClient.js` file, the app was still throwing a module not found error because the old `page.js` hadn't been replaced yet. Replacing all the old files with the new ones fixed it.

### 7. Google not prompting account selection on re-login
After logging out, clicking "Continue with Google" would silently log back in with the same account without showing the account picker. Fixed by adding `queryParams: { prompt: 'select_account' }` to the OAuth options, which forces Google to always show the account chooser.

### 8. Real-time not working
The Supabase real-time subscription in the code was correct but updates weren't coming through. The fix was enabling replication for the bookmarks table by running this in the Supabase SQL Editor:
```sql
alter publication supabase_realtime add table bookmarks;
```

### 9. Git push failing with "repository not found"
When pushing to GitHub, I had accidentally left the placeholder `YOUR_USERNAME` in the remote URL. Fixed it with:
```bash
git remote set-url origin https://github.com/sahityasami27/smart-bookmark-app.git
```

---

## Setup & Run Locally

1. Clone the repo
```bash
git clone https://github.com/sahityasami27/smart-bookmark-app.git
cd smart-bookmark-app
```

2. Install dependencies
```bash
npm install
```

3. Create `.env.local` in the root:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the dev server
```bash
npm run dev
```

## Deployment
Deployed on Vercel. Environment variables are configured in Vercel project settings. The Vercel deployment URL is added to Supabase → Authentication → URL Configuration → Redirect URLs as `https://your-app.vercel.app/auth/callback`.