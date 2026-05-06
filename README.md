# Resume Builder SaaS

A SaaS-ready resume builder built with Next.js. It includes a live resume editor, ATS score, template switching, browser PDF export, and an AI enhancement API route.

## Local Development

```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:3000`.

## AI Setup

Create a `.env.local` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

The app calls `/api/enhance` to improve summary and experience bullets.

## Deploy

Deploy to Vercel:

1. Push this repository to GitHub.
2. Go to Vercel and import the GitHub repo.
3. Add `OPENAI_API_KEY` in Vercel project environment variables.
4. Deploy.

The GitHub Pages version can stay as a static demo, but the SaaS version should run on Vercel because it needs an API route.
