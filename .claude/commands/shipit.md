---
description: Promote the current staging site to production (live site)
---

You're being asked to promote whatever is currently on `staging` to
production (`main` branch, which serves https://annahileman.com).

The `main` branch is protected. You CANNOT push to it directly. You must
go through a pull request.

Steps:
1. Confirm `staging` is up to date with origin (`git fetch && git status`).
2. Make sure there are no uncommitted changes on staging. If there are,
   stop and ask the user what to do.
3. Create a PR from `staging` to `main`:
   `gh pr create --base main --head staging --title "Deploy to production" --body "Promoting staging to production"`
4. Merge it immediately:
   `gh pr merge --merge` (use the PR number if needed)
5. Capture the SHA of `main` after merge: `git fetch && git rev-parse --short origin/main`.
6. Wait 45 seconds for Cloudflare Pages to build production.
7. Fetch https://annahileman.com and verify the `git-commit` meta tag matches.
8. Repeat the check every 15 seconds for up to 3 minutes if needed.
9. Confirm: "Done. It's live at https://annahileman.com[/page]."

If `gh` isn't installed or the PR fails, stop and explain the issue in plain
English. Do not try to bypass branch protection.
