# 05 · Operations — AI help: the admin, the leads and the site's chat (2.6.0, 2.7.0)

- **Versions:** 2.6.0 merged on 2026-11-22 (PR #61), 2.7.0 the same day (PR #62). **Neither got its own release
  commit or tag:** `npm run release:minor` wasn't run between the merges, and on 2026-11-22 the owner chose to set
  main straight to **2.8.0** (`a87dcef`, tag `v2.8.0`), which includes both. There is no `v2.6.0` or `v2.7.0` tag.
- **CHANGELOG entries:** ☑ `## [2.6.0] - 2026-11-22`, ☑ `## [2.7.0] - 2026-11-22`.
- **Deploy notes:**
  - **Site and function:** deploy with the merge (the function is `api/`, built and deployed with the site).
  - **Rules, data, dependencies:** none.
  - **Azure settings** (Static Web App → Settings → Environment variables → Production; steps in
    [deployment.md](../../architecture/deployment.md)):
    - ☐ `AI_API_URL`, `AI_MODEL`, `AI_API_KEY`: until they're set, the admin shows no AI buttons and the chat uses only
      the script.
    - ☐ `AI_VISION_MODEL` (optional): **Suggest a description** for pictures.
    - ☐ `AI_CHAT` = `on`: typed questions in the site's chat go to the AI.
- **First use:** after the settings, an **AI help** button sits under each text field; Leads offers **Analyse**; a
  typed question in the site's chat is answered by AI.
- **Monitoring:** the provider's dashboard (Groq) for usage and errors; the function's limits (per visitor, per account,
  per day) answer "not available" when reached, and the chat falls back to the script. Provider errors are not logged
  in detail, so their messages can't leak a request.
- **Rollback, without a redeploy:** remove `AI_CHAT` to stop the site's AI answers, or `AI_API_KEY` to stop all AI help;
  everything else works as before. **With a redeploy:** the merge before 2.6.0 is `3629c50` (2.5.0), tag `v2.5.0`.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-22.
