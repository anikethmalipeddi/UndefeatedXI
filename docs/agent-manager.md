# Agent Manager Architecture

The Agent Lab is a real orchestration feature built on the same structured data as the simulation engine. It does not use a chatbot prompt over a screenshot or free-form user profile. Each request is bound to one run ID, one formation, the drafted squad, the engine's team ratings, tactic and chemistry reports, and simulation probabilities.

## Runtime flow

1. The browser builds a compact, versioned context from the completed run.
2. The request boundary rejects oversized payloads, malformed identifiers, invalid ratings, and impossible squad sizes.
3. Signed-in cloud runs authenticate the user and enforce an eight-runs-per-hour rate limit.
4. Scout and tactician agents run in parallel with separate instructions and strict output schemas.
5. A deterministic critic challenges their evidence against position-fit, chemistry, tactical warnings, and the current win/loss baseline.
6. The manager agent reconciles the reports into exactly three prioritized changes with measurable rollback criteria.
7. The browser validates and sanitizes the final report again before rendering it.

Every stage appears in an expandable trace. This makes the workflow understandable as a system instead of presenting a single opaque answer.

## Failure recovery

- Model requests time out after 18 seconds and retry once for rate-limit or server failures.
- Specialists execute with `Promise.allSettled`, so one failed role cannot discard the other role's work.
- Each specialist has a deterministic, data-grounded implementation.
- The manager has a complete deterministic synthesis path.
- The browser independently falls back to its local runtime if the Edge Function, authentication, network, or output schema fails.
- Recommendations explicitly preserve the original run as a regression baseline.

## Security and privacy

- `OPENAI_API_KEY` is read only inside the Supabase Edge Function and is never placed in a `VITE_` variable or browser bundle.
- Cloud execution requires a valid Supabase user JWT; administrative database access uses server-side secrets.
- The model receives only squad and simulation context. Email, display name, user ID, and profile metadata are excluded.
- Input is size-bounded and field-validated; model output uses strict JSON Schema and is validated again by the client.
- The existing `rate_limits` table is protected with RLS and unavailable to anonymous/authenticated database clients.

The implementation follows the current [OpenAI Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs) and [Supabase Edge Function authentication guidance](https://supabase.com/docs/guides/functions/auth).

## Deployment

```bash
supabase secrets set OPENAI_API_KEY=... OPENAI_MODEL=gpt-4.1-mini
npm run supabase:function:agents
```

The function remains usable without an OpenAI key by returning the deterministic report, but the UI labels that recovery path transparently.
