# ResuMatch AI — Backend

## AI matching setup
1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` and `JWT_SECRET`.
3. Set `GEMINI_API_KEY` to enable AI match analysis.
4. Optionally set `GEMINI_MODEL` to a model available to your Gemini account.

The match calculation endpoint now verifies that the selected resume belongs to the authenticated user. It also attempts AI analysis and returns the analyzed match when Gemini is configured.

### AI endpoint
`POST /api/matches/:matchId/ai-analysis` with `{ "resumeId": "..." }` regenerates the analysis for an existing match.
