# Commit identity privacy

BetterButtons keeps the maintainer's personal email address out of public Git history while leaving contributors free to use their own preferred Git identity.

## Maintainer configuration

GitHub account settings use **Keep my email addresses private** and **Block command line pushes that expose my email**. Local Git uses the ID-based GitHub noreply address:

```bash
git config --global user.email "25175104+Alexsvensson99@users.noreply.github.com"
git config --global user.useConfigOnly true
```

Before a public push, inspect the outgoing maintainer identities and verify that both author and committer use the approved noreply address.

## Repository guard

The `Commit identity privacy` CI job checks every commit added by a pull request or push. It rejects maintainer author or committer metadata that does not use the approved noreply identity. Failure messages identify the commit and role without echoing the rejected address.

External contributor identities are not restricted by this maintainer-specific guard.

## Branch updates

Keep GitHub's repository-level automatic update-branch option disabled. Update a stale branch locally, inspect its complete outgoing commit metadata, and push only after the local pre-push guard passes. Treat web-generated commits as unverified until their public API metadata has been checked.
