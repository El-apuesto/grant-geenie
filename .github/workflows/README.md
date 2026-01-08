# GitHub Actions Workflows

## Auto-Generate Daily Blog Post

Automatically generates and publishes a new grant-related blog post every day at 9 AM CST.

### Features:

✅ **Daily Posts:** Runs automatically every day  
✅ **AI-Generated:** Uses OpenAI GPT-4 to write quality content  
✅ **20+ Topics:** Rotates through grant writing, funding, tips, and resources  
✅ **SEO-Optimized:** Proper formatting, excerpts, and metadata  
✅ **Auto-Deploy:** Commits to repo and deploys to Vercel  

### Setup Required:

1. **Get OpenAI API Key:**
   - Go to https://platform.openai.com/api-keys
   - Create new secret key
   - Copy the key

2. **Get Vercel Credentials:**
   ```bash
   npm i -g vercel
   vercel login
   cd blog
   vercel link
   cat .vercel/project.json
   ```

3. **Add GitHub Secrets:**
   - Go to repo → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `OPENAI_API_KEY` - Your OpenAI API key
     - `VERCEL_TOKEN` - Your Vercel token
     - `VERCEL_ORG_ID` - From project.json
     - `VERCEL_PROJECT_ID` - From project.json

### How It Works:

1. **9 AM Daily:** GitHub Actions triggers automatically
2. **AI Writes:** GPT-4 generates 800-1200 word blog post
3. **Commits:** New post added to `blog/_posts/`
4. **Builds:** Jekyll builds the static site
5. **Deploys:** Pushes to Vercel at blog.granthustle.org

### Manual Trigger:

Go to Actions tab → "Auto-Generate Daily Blog Post" → Run workflow

### Topics Covered:

- Grant writing tips and strategies
- Funding research and discovery
- Fiscal sponsorship guidance
- Success stories and case studies
- Application best practices
- Funder relationships
- Budget and reporting

---

## Deploy Jekyll Blog

Deployment workflow for manual blog updates (see deploy-blog.yml)
