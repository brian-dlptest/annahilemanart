---
description: Undo the most recent change on staging (and production if it shipped)
---

You're being asked to revert the most recent change.

Steps:
1. Check the most recent commit on `staging`: `git log -1 --oneline`.
2. Confirm with the user that this is the change they want to undo. Read
   them the commit message in plain English. Wait for confirmation.
3. Revert it: `git revert HEAD --no-edit`.
4. Push to `origin/staging`.
5. Verify the staging deploy completes (see `/preview` for the verify pattern).
6. Check whether the original (now-reverted) commit was also on `main`:
   `git log origin/main --oneline | head -5` and look for the SHA.
7. If it WAS on main (already in production), tell the user:
   "This change is also live on the real site. Want me to undo it there too?"
   If yes, run `/shipit` flow to promote the revert to production.
8. If it was only on staging, just confirm: "Reverted on staging. The real
   site was never affected."

Never use `git reset --hard` on a shared branch. Always use `git revert`.
