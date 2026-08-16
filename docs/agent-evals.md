# Agent Eval Suite

Run the deterministic eval harness with:

```bash
npm run agents:eval
```

The suite evaluates three identical run contexts with different objectives and fails the process if any check fails:

| Eval | Required behavior |
| --- | --- |
| Input schema | Every fixture passes the production request validator |
| Output schema | Every result survives the production cloud-response validator |
| Trace completeness | Context, scout, tactician, critic, and manager all appear |
| Evidence coverage | Exactly three recommendations each carry evidence |
| Objective sensitivity | Balance, attack, and resilience produce distinct plans |
| Roster grounding | Every player named in generated evidence belongs to the supplied squad |

Vitest adds unit coverage for malformed outputs, run-ID binding, control-character sanitization, guardrails, and objective-sensitive recommendations. The full application test drafts an XI, runs the Agent Lab, and opens the reasoning trace.

The harness is intentionally deterministic so it can gate pull requests without network credentials. Model-backed quality can be evaluated separately against the same schemas without making CI dependent on a paid API.
