# dev.ecoslay-mag.com setup

GitHub Pages can only serve **one custom domain per repo**. So `ecoslay-mag.com` (main) and `dev.ecoslay-mag.com` (refactor-background) must live in **two repos**.

## 1. Create dev repo
- https://github.com/new → Owner: `ecoslay-mag`, Name: `dev.ecoslay-mag.com`, Public
- Do NOT init with README.

## 2. Enable Pages on dev repo
- dev repo → Settings → Pages → Build and deployment: Deploy from branch → Branch: `main`, Folder: `/ (root)`
- Custom domain: `dev.ecoslay-mag.com` → Save (GitHub will verify DNS after step 3)
- Enforce HTTPS after cert issues.

## 3. DNS (where ecoslay-mag.com is managed)
Add:
```
Type: CNAME
Name: dev
Target: ecoslay-mag.github.io
TTL: 3600
```
Or if apex uses A records, add the 4 GitHub Pages IPs for dev? CNAME is simpler and preferred.
Wait for DNS propagation (dig dev.ecoslay-mag.com).

## 4. Push current branch to dev repo (manual, works today)
```bash
cd /home/nmd/Projects/ecoslay-mag/website
git remote add dev git@github.com-ecoslay:ecoslay-mag/dev.ecoslay-mag.com.git
git push dev refactor-background:main --force
# Pages will deploy main → https://dev.ecoslay-mag.com
```

## 5. Automatic sync (optional)
- In this repo (ecoslay-mag.github.io) → Settings → Secrets → Actions → New secret `DEV_PAT` (classic PAT with `repo` scope)
- The workflow `.github/workflows/deploy-dev.yml` will auto-push every `refactor-background` push to the dev repo.
- No PAT? Workflow still passes and prints manual instructions.

## Why not single-repo Actions?
`actions/deploy-pages` deploys to the **same Pages site** (one domain). Pushing dev branch would overwrite prod. Separate repo is the correct GitHub Pages pattern for a persistent dev subdomain.
