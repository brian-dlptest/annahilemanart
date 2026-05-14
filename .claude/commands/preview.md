---
description: Push current staging changes and verify the deploy is live
---

You're being asked to push the current changes on the `staging` branch to
Cloudflare Pages and verify the deploy completed successfully.

Steps:
1. Confirm we're on the `staging` branch. If not, switch to it.
2. Stage any uncommitted changes. Show the diff briefly so the user can
   confirm.
3. Commit with a clear, plain-English message describing what changed.
4. Push to `origin/staging`.
5. Capture the short SHA: `git rev-parse --short HEAD`.
6. Wait 45 seconds.
7. Fetch https://staging.annahileman.com and look for the
   `<meta name="git-commit" content="...">` tag.
8. If the SHA matches, the deploy is live. Move on.
9. If it doesn't, wait 15 seconds and check again. Repeat up to 3 minutes
   total. After that, tell the user the deploy is still building and
   suggest they check https://dash.cloudflare.com.
10. Report back with:
    - One sentence: what changed
    - Direct URL to the affected page on staging
    - The "Looks good? / Want changes? / Want to undo?" prompt from
      CLAUDE.md

Do not push to `main` from this command. That's `/shipit` only.
