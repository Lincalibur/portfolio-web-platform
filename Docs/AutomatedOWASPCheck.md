That makes total sense. Without a enterprise/pro account for advanced rulesets, running the automation purely through standard GitHub Actions workflows is a fantastic approach. Since you can't strictly lock the merge button behind branch protection on a free/personal tier repository without specific setups, the pipeline will still do exactly what you want: it will run automatically, turn the PR red/fail the build, and dynamically create or comment on the tracking issues so you can manage the feedback loop manually.

Here is the step-by-step implementation guide to add these changes to your repository for the `development` branch.

---

## Step 1: Create the Workflow File

You need to place the workflow file in a specific directory structure within your project so GitHub recognizes it.

1. Open your project locally on your machine.
2. In the root directory, create a folder named `.github` (note the dot).
3. Inside `.github`, create another folder named `workflows`.
4. Inside `workflows`, create a file named `security-gate.yml`.

Your directory structure should look exactly like this:

```text
your-repo-root/
└── .github/
    └── workflows/
        └── security-gate.yml

```

---

## Step 2: Paste the Pipeline Configuration

Open `security-gate.yml` in your code editor and paste the following complete configuration. This is tailor-made for your workflow: it runs whenever changes are proposed to `development` via a pull request, or whenever code lands directly on `development`.

```yaml
name: OWASP Security Gate

on:
  pull_request:
    branches:
      - development
  push:
    branches:
      - development

permissions:
  contents: read
  issues: write

jobs:
  owasp-scan-suite:
    name: OWASP Complete Security Suite
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Needed for comprehensive history secret scanning

      # --- Setup Project Environment ---
      - name: Setup .NET Core
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'

      # --- SCAN 1: Software Composition Analysis (A06) ---
      - name: Run Dependency Scan
        id: run_sca
        continue-on-error: true
        run: |
          echo "Scanning dependencies for known vulnerabilities..."
          dotnet list package --vulnerable --include-transitive

      # --- SCAN 2: Secret Scanning (A02) ---
      - name: Run TruffleHog Secrets Scan
        id: run_secrets
        continue-on-error: true
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD
          extra_args: --only-verified

      # --- SCAN 3: Static Application Security Testing (A01/A03) ---
      - name: Run Semgrep SAST
        id: run_sast
        continue-on-error: true
        run: |
          echo "Running Semgrep against OWASP Top 10 Rulesets..."
          # Running via docker/npx standard execution for ease of setup
          npx semgrep --config=p/owasp-top-10 --error

      # --- TRIAgE & LOOP LOGIC ---
      - name: Evaluate Results & Manage Issues
        # This step runs ONLY if one or more of the scans above flagged a failure
        if: steps.run_sca.outcome == 'failure' || steps.run_secrets.outcome == 'failure' || steps.run_sast.outcome == 'failure'
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          echo "Security vulnerability detected. Checking for an existing open ticket..."
          
          # Search for an already open tracking issue for this gate
          EXISTING_ISSUE=$(gh issue list --search "Security Gate Failure: Development" --state open --json number --jq '.[0].number')
          
          if [ -z "$EXISTING_ISSUE" ]; then
            echo "No existing open issue found. Creating a fresh tracking ticket..."
            gh issue create \
              --title "Security Gate Failure: Development" \
              --body "### 🛑 Security Suite Scan Failure on Development
              The automated pipeline detected vulnerabilities that need resolution before merging to production.
              
              **Scan Status Breakdown:**
              - 📦 Dependency Scan (A06): **${{ steps.run_sca.outcome }}**
              - 🔑 Secrets Scan (A02): **${{ steps.run_secrets.outcome }}**
              - 🔍 SAST Code Scan (A01/A03): **${{ steps.run_sast.outcome }}**
              
              ---
              #### 🛠️ Next Steps
              1. Keep this issue open.
              2. Spin up a new feature branch to address the failure (e.g., \`feature/fix-security-gate\`).
              3. Resolve the vulnerability, push it back to \`development\`, and let the pipeline verify it.
              
              - **Detailed Pipeline Run Logs:** ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}" \
              --label "security"
          else
            echo "Open tracking issue #$EXISTING_ISSUE detected. Posting a status update..."
            gh issue comment $EXISTING_ISSUE --body "🔄 **Pipeline Update:** Security checks failed again on commit \`${{ github.sha }}\`. 
            - Dependency Scan: **${{ steps.run_sca.outcome }}**
            - Secrets Scan: **${{ steps.run_secrets.outcome }}**
            - SAST Scan: **${{ steps.run_sast.outcome }}**
            
            [View latest execution logs here](${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }})"
          fi

          # Forcefully fail the job here to visually flag the red badge on the PR/Commit
          exit 1

```

---

## Step 3: Grant Workflow Write Access on GitHub

Even though you are running this manually on a personal account, you still have to give the default `GITHUB_TOKEN` permission to write issues to your repository tracker:

1. Open your web browser and go to your repository on GitHub.
2. Click on the **Settings** tab at the top.
3. On the left sidebar, click on **Actions** $\rightarrow$ **General**.
4. Scroll all the way down to the **Workflow permissions** section.
5. Change the selection from *Read repository contents and packages permissions* to **Read and write permissions**.
6. Click **Save**.

---

## Step 4: Commit and Push to Initialize

Now you just need to bring your `development` branch up to speed with these configuration steps.

1. In your local terminal, switch to your development branch:
```bash
git checkout development

```


2. Add the new files:
```bash
git add .github/workflows/security-gate.yml

```


3. Commit the changes:
```bash
git commit -m "ci: add automated security gate workflow for development branch"

```


4. Push to your origin repository:
```bash
git push origin development

```



---

## How It Works in Practice From Here on Out

Since you are managing the gate manually, your process will look like this:

* Whenever you open a PR from a `feature/something` branch into `development`, the action fires off automatically.
* If it turns **Green (Success)**, you know you are safe to merge!
* If it turns **Red (Failure)**, go look at the **Issues** tab on your repository. You will find a brand new ticket listing what failed with a direct link to the logs.
* You can simply checkout a branch from that issue, fix it, push it up to your feature PR, and watch the check re-run until it clears. Once you manually verify it's green, you can hit merge.