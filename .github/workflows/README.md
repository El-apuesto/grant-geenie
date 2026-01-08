# GitHub Actions Workflows

## Deploy Jekyll Blog

Automatically builds and deploys the Jekyll blog to Vercel when changes are pushed to the `blog/` directory.

### Setup Required:

1. **Get Vercel Token:**
   - Go to https://vercel.com/account/tokens
   - Create new token
   - Copy the token

2. **Get Vercel IDs:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # Link project
   cd blog
   vercel link
   
   # Get IDs from .vercel/project.json
   cat .vercel/project.json
   ```

3. **Add GitHub Secrets:**
   - Go to your repo → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `VERCEL_TOKEN` - Your Vercel token
     - `VERCEL_ORG_ID` - From project.json
     - `VERCEL_PROJECT_ID` - From project.json

### How It Works:

- **Trigger:** Pushes to `main` branch that modify `blog/` files
- **Build:** Installs Ruby, bundles gems, builds Jekyll site
- **Deploy:** Deploys to Vercel at blog.granthustle.org
- **Manual:** Can also trigger manually from Actions tab
