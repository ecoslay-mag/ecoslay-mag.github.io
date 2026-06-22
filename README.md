# ECOSLAY MAGAZINE WEBSITE

## Maintenance

### 0. Clone the repository
```bash
git clone git@github.com:ecoslay-mag/website.git
cd website
```

### 1. Make edits via opencode
```bash
opencode
```
Run opencode inside the root directory of the git. Describe the changes you want in natural language. Use plan mode when the task is complex and requires iteration/checking that the AI understand, and build to execute (directly for a simple task or after you are happy with the plan.) 

### 2. Preview locally with a local server
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000` in a browser to preview the changes.

### 3. Commit and push to deploy
```bash
git add -A
git commit -m "description of changes"
git push
```

The site is static HTML/CSS/JS — pushing to `main` deploys automatically. A Github action is triggered at each push, and takes a few seconds to deploy on https://ecoslay-mag.github.io/.
