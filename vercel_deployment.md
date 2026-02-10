"# 🚀 Vercel Deployment Guide for Your Blog

## Complete Step-by-Step Guide

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Configuration](#project-configuration)
3. [Vercel Settings](#vercel-settings)
4. [Environment Variables](#environment-variables)
5. [Deployment Steps](#deployment-steps)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### ✅ Before Deploying:

1. **MongoDB Atlas Setup** (Required for production)
   - Local MongoDB won't work on Vercel
   - Follow: `/app/MONGODB_SETUP.md` → \"Option 2: MongoDB Atlas\"
   - Get your connection string

2. **GitHub Repository**
   - Push your code to GitHub
   - Make sure `.env` is in `.gitignore`

3. **Vercel Account**
   - Sign up at: https://vercel.com/signup
   - Use GitHub to sign up (easiest)

---

## Project Configuration

### 1. Root Directory Structure

Your project structure:
```
/app/                           ← ROOT DIRECTORY
├── app/                        ← Next.js app folder
│   ├── page.js
│   ├── layout.js
│   ├── globals.css
│   ├── api/
│   └── ...
├── components/                 ← Components
├── lib/                        ← Libraries
├── public/                     ← Static files
├── package.json               ← Dependencies
├── next.config.js             ← Next.js config
├── tailwind.config.js         ← Tailwind config
└── .env                       ← Environment variables (DON'T COMMIT)
```

**Important:** Your root directory is `/app` (the folder with package.json)

### 2. Vercel Configuration File

Create `/app/vercel.json`:

```json
{
  \"buildCommand\": \"yarn build\",
  \"devCommand\": \"yarn dev\",
  \"installCommand\": \"yarn install\",
  \"framework\": \"nextjs\",
  \"outputDirectory\": \".next\"
}
```

### 3. Update .gitignore

Make sure `/app/.gitignore` includes:

```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env
.env*.local
.env.development.local
.env.test.local
.env.production.local

# vercel
.vercel
```

---

## Vercel Settings

### ⚙️ Build & Development Settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `app` or leave empty if repo root is /app |
| **Build Command** | `yarn build` |
| **Output Directory** | `.next` (leave default) |
| **Install Command** | `yarn install` |
| **Node Version** | 18.x (recommended) |

### Detailed Settings:

#### 1. Framework Preset
```
Next.js (Auto-detected)
```

#### 2. Root Directory
```
app
```
**Or leave empty if your GitHub repo root IS the /app folder**

#### 3. Build Command
```
yarn build
```
**Alternative:**
```
npm run build
```

#### 4. Output Directory
```
.next
```
**Note:** This is Next.js default, Vercel auto-detects it

#### 5. Install Command
```
yarn install
```
**Alternative:**
```
npm install
```

---

## Environment Variables

### 🔐 Required Environment Variables

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:

#### 1. MongoDB Connection
```
Name: MONGO_URL
Value: mongodb+srv://user:password@cluster.mongodb.net/blog_db?retryWrites=true&w=majority

Environment: Production, Preview, Development
```

#### 2. Database Name
```
Name: DB_NAME
Value: blog_db

Environment: Production, Preview, Development
```

#### 3. NextAuth URL
```
Name: NEXTAUTH_URL
Value: https://your-domain.vercel.app

Environment: Production
```

```
Name: NEXTAUTH_URL
Value: https://your-preview-url.vercel.app

Environment: Preview
```

```
Name: NEXTAUTH_URL
Value: http://localhost:3000

Environment: Development
```

#### 4. NextAuth Secret
```
Name: NEXTAUTH_SECRET
Value: your-super-secret-key-min-32-characters-long

Environment: Production, Preview, Development
```

**Generate secret:**
```bash
openssl rand -base64 32
```

#### 5. Public Base URL
```
Name: NEXT_PUBLIC_BASE_URL
Value: https://your-domain.vercel.app

Environment: Production
```

#### 6. CORS Origins
```
Name: CORS_ORIGINS
Value: *

Environment: Production, Preview, Development
```

#### 7. Google OAuth (Optional)
```
Name: GOOGLE_CLIENT_ID
Value: your-google-client-id

Name: GOOGLE_CLIENT_SECRET
Value: your-google-client-secret

Environment: Production, Preview, Development
```

#### 8. Microsoft OAuth (Optional)
```
Name: MICROSOFT_CLIENT_ID
Value: your-microsoft-client-id

Name: MICROSOFT_CLIENT_SECRET
Value: your-microsoft-client-secret

Environment: Production, Preview, Development
```

---

## Deployment Steps

### 🚀 Method 1: Deploy via Vercel Dashboard (Easiest)

#### Step 1: Push to GitHub
```bash
# Initialize git (if not already)
cd /app
git init

# Add all files
git add .

# Commit
git commit -m \"Initial commit\"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/your-blog.git

# Push
git push -u origin main
```

#### Step 2: Import to Vercel

1. Go to: https://vercel.com/new
2. Click \"**Import Git Repository**\"
3. Select your GitHub repository
4. Configure project:

**Project Settings:**
```
Project Name: my-data-science-blog
Framework Preset: Next.js
Root Directory: app
```

**Build Settings:**
```
Build Command: yarn build
Output Directory: .next
Install Command: yarn install
```

5. Add Environment Variables (see above section)
6. Click \"**Deploy**\"

#### Step 3: Wait for Deployment
- Usually takes 2-5 minutes
- Watch the build logs
- You'll get a URL like: `https://my-blog-xxx.vercel.app`

---

### 🚀 Method 2: Deploy via Vercel CLI

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login
```bash
vercel login
```

#### Step 3: Deploy
```bash
cd /app
vercel
```

Follow the prompts:
```
? Set up and deploy \"~/app\"? [Y/n] y
? Which scope? Your Name
? Link to existing project? [y/N] n
? What's your project's name? my-blog
? In which directory is your code located? ./
? Want to override the settings? [y/N] n
```

#### Step 4: Deploy to Production
```bash
vercel --prod
```

---

## Post-Deployment

### 1. Custom Domain (Optional)

**Add custom domain:**
1. Go to: Project Settings → Domains
2. Add your domain: `yourdomain.com`
3. Configure DNS:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### 2. Update OAuth Redirect URIs

**Google OAuth:**
1. Go to: https://console.cloud.google.com
2. Your Project → Credentials
3. Edit OAuth Client
4. Add Authorized redirect URIs:
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```

**Microsoft OAuth:**
1. Go to: https://portal.azure.com
2. App registrations → Your app
3. Authentication → Add redirect URI:
   ```
   https://your-domain.vercel.app/api/auth/callback/microsoft
   ```

### 3. Update Environment Variables

Update `NEXTAUTH_URL` and `NEXT_PUBLIC_BASE_URL` with your actual domain:
```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

### 4. Test Deployment

Visit your site:
```
https://your-project.vercel.app
```

Test functionality:
- ✅ Homepage loads
- ✅ Blog posts display
- ✅ Auth modal works
- ✅ Registration works
- ✅ Login works
- ✅ Admin panel accessible

---

## File Locations Summary

### Local Development (.env location):
```
/app/.env                      ← Local environment variables
```

### Vercel (Environment Variables):
```
Vercel Dashboard
→ Your Project
→ Settings
→ Environment Variables        ← Production environment variables
```

**Important:**
- ❌ **Never commit** `.env` to GitHub
- ✅ **Always add** `.env` to `.gitignore`
- ✅ **Set variables** in Vercel Dashboard

---

## Build Configuration Details

### package.json Scripts:
```json
{
  \"scripts\": {
    \"dev\": \"next dev\",
    \"build\": \"next build\",
    \"start\": \"next start\",
    \"lint\": \"next lint\"
  }
}
```

### Vercel Build Process:
```
1. Install dependencies: yarn install
2. Run build: yarn build
3. Output: .next directory
4. Deploy: Serverless functions + static files
```

### What Gets Deployed:
```
✅ .next/ (built application)
✅ public/ (static files)
✅ Server functions (API routes)
❌ node_modules/ (not needed)
❌ .env (use Vercel env vars)
❌ Source files (only built output)
```

---

## Troubleshooting

### Issue 1: Build Fails - MongoDB Connection

**Error:**
```
MongoServerError: Authentication failed
```

**Solution:**
1. Verify MongoDB Atlas connection string in Vercel env vars
2. Check MongoDB Atlas IP whitelist (add 0.0.0.0/0)
3. Ensure password doesn't have special characters or URL-encode them

### Issue 2: Environment Variables Not Working

**Error:**
```
Cannot read properties of undefined
```

**Solution:**
1. Check variables are added in Vercel Dashboard
2. Ensure correct environment (Production/Preview/Development)
3. Redeploy after adding variables:
   ```bash
   vercel --prod
   ```

### Issue 3: Root Directory Error

**Error:**
```
No package.json found
```

**Solution:**
1. Set Root Directory to `app` in Vercel settings
2. Or ensure your GitHub repo root contains package.json

### Issue 4: OAuth Not Working

**Error:**
```
Redirect URI mismatch
```

**Solution:**
1. Add Vercel URL to OAuth provider redirect URIs
2. Update NEXTAUTH_URL in Vercel env vars
3. Format: `https://your-domain.vercel.app/api/auth/callback/[provider]`

### Issue 5: API Routes 404

**Error:**
```
404 on /api/posts
```

**Solution:**
1. Check API routes are in `/app/app/api/` folder
2. Verify Next.js App Router structure
3. Check build logs for errors

### Issue 6: Build Command Fails

**Error:**
```
yarn: command not found
```

**Solution:**
Change build command to:
```
npm run build
```

And install command to:
```
npm install
```

---

## Environment Variables Checklist

### Before Deployment:

- [ ] MongoDB Atlas cluster created
- [ ] MongoDB connection string obtained
- [ ] Database user created in Atlas
- [ ] IP address whitelisted (0.0.0.0/0)
- [ ] NextAuth secret generated
- [ ] OAuth credentials obtained (if using)
- [ ] All env vars added to Vercel
- [ ] `.env` added to `.gitignore`

### After Deployment:

- [ ] Site accessible at Vercel URL
- [ ] Homepage loads correctly
- [ ] Auth modal appears
- [ ] Registration works
- [ ] Login works
- [ ] Posts display
- [ ] Admin panel accessible
- [ ] OAuth redirect URIs updated
- [ ] Custom domain configured (optional)

---

## Quick Reference

### Vercel Dashboard URLs:
```
Main Dashboard: https://vercel.com/dashboard
Project Settings: https://vercel.com/[username]/[project]/settings
Environment Variables: https://vercel.com/[username]/[project]/settings/environment-variables
Deployments: https://vercel.com/[username]/[project]/deployments
```

### Essential Commands:
```bash
# Deploy
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs [deployment-url]

# List deployments
vercel list

# Remove deployment
vercel remove [deployment-name]
```

### Build Settings Summary:
```
Root Directory: app (or empty)
Build Command: yarn build
Output Directory: .next
Install Command: yarn install
Node Version: 18.x
```

---

## Example .env for Reference

**Local Development (.env):**
```env
# MongoDB (Local or Atlas)
MONGO_URL=mongodb://localhost:27017
DB_NAME=blog_db

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-dev-secret-key-change-in-production

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CORS_ORIGINS=*
```

**Production (Vercel Dashboard):**
```
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/blog_db
DB_NAME=blog_db
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=production-secret-32-chars-min
GOOGLE_CLIENT_ID=your-id
GOOGLE_CLIENT_SECRET=your-secret
MICROSOFT_CLIENT_ID=your-id
MICROSOFT_CLIENT_SECRET=your-secret
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
CORS_ORIGINS=*
```

---

## Best Practices

### 1. Environment Management
- ✅ Use different databases for production/staging
- ✅ Different OAuth credentials per environment
- ✅ Never commit secrets to git
- ✅ Use Vercel's environment variable scoping

### 2. Deployment Strategy
- ✅ Test on Preview deployments first
- ✅ Use `vercel` for preview, `vercel --prod` for production
- ✅ Monitor build logs for errors
- ✅ Set up custom domain after initial deployment

### 3. Security
- ✅ Rotate secrets regularly
- ✅ Use strong NextAuth secret (32+ characters)
- ✅ Whitelist only necessary IPs in MongoDB Atlas
- ✅ Enable HTTPS (automatic on Vercel)

### 4. Performance
- ✅ Enable caching in Vercel
- ✅ Use MongoDB Atlas indexes
- ✅ Optimize images (Next.js Image component)
- ✅ Monitor Vercel Analytics

---

## Next Steps After Deployment

1. **Test Everything:**
   - Sign up/login
   - Create posts (as admin)
   - Browse posts
   - Test social sharing
   - Check mobile responsiveness

2. **Configure Custom Domain** (Optional but recommended)

3. **Set up Analytics:**
   - Vercel Analytics
   - Google Analytics
   - MongoDB Atlas monitoring

4. **Backup Strategy:**
   - MongoDB Atlas automatic backups
   - GitHub repository backups

5. **Monitoring:**
   - Vercel deployment notifications
   - Error tracking (Sentry, LogRocket)
   - Uptime monitoring

---

## Summary

### File Locations:
```
Root Directory: /app
.env file: /app/.env (local only, not committed)
Environment Variables: Vercel Dashboard (production)
```

### Build Configuration:
```
Build Command: yarn build
Output Directory: .next
Install Command: yarn install
Framework: Next.js
```

### Deployment:
```
1. Setup MongoDB Atlas
2. Push to GitHub
3. Import to Vercel
4. Add environment variables
5. Deploy
6. Test
7. Add custom domain (optional)
```

**Your blog is ready to go live! 🚀**
"