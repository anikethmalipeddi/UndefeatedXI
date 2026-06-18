# UndefeatedXI Simulation Rebalance Summary

Generated: 2026-06-18T19:29:25.864Z

## Audit Artifacts

- Before snapshot: `reports/simulation-audits/before-rebalance.json` (8 smart teams, 200 best reruns; reduced pre-rebalance snapshot preserved from /tmp).
- After snapshot: `reports/simulation-audits/after-rebalance.json` (60 smart teams/mode, 30 smart reruns/team, 30000 best reruns/mode, 500 random drafts/mode, 500 greedy drafts/mode).
- Seeds: 42, 1337, 99999, 12345, 7.
- Final full audit runtime: 14.5 minutes.

## Deployment Gate

Status: PASS

- Long leagues are rare-but-possible: Yes.
- Random long-league perfect seasons: 0.
- Smart drafting beats or ties greedy in 20/21 modes by per-match win rate; AFCON is the one small exception at a 0.6 percentage-point greedy edge.
- Result tiers, streaks, tactical reasons, scoringVersion 2, and one-best-run-per-user/mode are covered by tests and code paths listed in the final verification.

## Formula Changes

- Effective team quality remains raw rating 50%, position fit 20%, chemistry 18%, role/formation balance 12%, then weak-link caps.
- The normalized quality curve changed to `46 + (composite - 78) * 1.55 + 30 * sigmoid((composite - 90) * 1.15)`, then capped. This flattens average teams while letting truly elite, balanced XIs separate.
- League fixture buckets now use a +7 league shift, except MLS uses -6 because its player pool is lower-rated; elite one-club campaigns use a +6 elite shift.
- AFCON knockout/group fixture ranges get -5 because the available pool is weaker than other international tournament pools.
- MLS playoff knockout ranges get -10 so a peak MLS draft can be rare-but-possible instead of mathematically dead.
- Chaos Mode uses normal base pressure with chaos events and a chaos-specific bucket mix of 12% elite, then 34% strong on the second draw, so volatility remains but peak teams are not blocked.
- Match odds still use dominance-delta sigmoid win odds, decreasing draw odds, probability floors, and two-phase draw-to-win conversion capped at 40%.

## By-Mode Results

| Mode | Before Best Perfect | After Best Perfect | Best Undefeated | Near Perfect | Random Win | Greedy Win | Smart Win | Best Win | Best Q | Best Avg Record |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| world_xi | 0.000% | 0.153% | 4.287% | 1.147% | 45.1% | 55.4% | 56.9% | 84.5% | 92 | 32.1-2.9-3.0 |
| premier_league | 0.000% | 0.393% | 6.337% | 2.070% | 55.0% | 67.8% | 73.8% | 86.2% | 96 | 32.8-2.6-2.6 |
| champions_league | 0.000% | 0.330% | 5.443% | 6.180% | 41.7% | 50.5% | 56.3% | 73.2% | 96 | 9.5-1.5-2.0 |
| world_cup | 0.000% | 4.933% | 22.417% | 53.840% | 36.7% | 44.9% | 47.0% | 73.9% | 92 | 4.0-0.5-0.9 |
| ball_knowledge | 0.000% | 0.213% | 5.223% | 1.500% | 45.8% | 54.9% | 59.9% | 85.3% | 93 | 32.4-2.8-2.8 |
| english_top_flight | 0.000% | 0.287% | 5.720% | 1.580% | 50.7% | 64.5% | 66.0% | 85.7% | 95 | 32.5-2.7-2.7 |
| laliga | 0.000% | 0.317% | 6.467% | 2.063% | 59.4% | 68.2% | 74.6% | 86.0% | 96 | 32.7-2.7-2.6 |
| serie_a | 0.000% | 0.393% | 6.230% | 2.147% | 61.3% | 70.2% | 77.3% | 86.3% | 96 | 32.8-2.6-2.6 |
| bundesliga | 0.000% | 0.570% | 8.303% | 3.590% | 53.8% | 69.3% | 73.4% | 86.2% | 96 | 29.3-2.3-2.4 |
| ligue_1 | 0.000% | 0.367% | 6.370% | 2.237% | 49.4% | 66.2% | 67.9% | 86.3% | 96 | 32.8-2.6-2.6 |
| mls | 0.000% | 0.053% | 2.217% | 0.377% | 34.7% | 56.7% | 57.4% | 81.9% | 89 | 30.2-3.2-3.5 |
| classic_european_cup | 0.500% | 2.717% | 14.963% | 33.250% | 30.1% | 33.8% | 40.8% | 63.6% | 96 | 3.3-0.7-1.2 |
| euros | 0.000% | 4.253% | 21.687% | 51.863% | 34.3% | 45.2% | 53.9% | 72.8% | 92 | 3.9-0.5-1.0 |
| copa_america | 0.000% | 3.747% | 21.200% | 50.780% | 32.9% | 41.9% | 51.5% | 71.9% | 91 | 3.8-0.5-1.0 |
| afcon | 0.500% | 1.503% | 15.820% | 40.630% | 34.2% | 47.1% | 46.5% | 66.5% | 80 | 3.4-0.6-1.1 |
| club_world_cup | 1.000% | 5.997% | 24.043% | 54.867% | 43.9% | 49.6% | 61.9% | 74.7% | 94 | 4.1-0.5-0.9 |
| one_club | 0.000% | 0.337% | 6.450% | 2.370% | 63.3% | 71.3% | 73.9% | 86.4% | 96 | 32.8-2.5-2.6 |
| nation_xi | 1.000% | 7.427% | 26.243% | 56.523% | 40.2% | 51.8% | 56.0% | 76.2% | 96 | 4.2-0.5-0.9 |
| era_lock | 0.000% | 0.493% | 7.387% | 2.617% | 50.1% | 63.2% | 66.4% | 86.9% | 96 | 33.0-2.5-2.5 |
| chaos | 0.000% | 0.070% | 2.880% | 0.627% | 42.8% | 52.2% | 53.7% | 83.0% | 93 | 31.5-3.1-3.4 |
| manager | 0.000% | 0.457% | 6.943% | 2.637% | 46.1% | 56.8% | 64.7% | 87.0% | 96 | 33.0-2.4-2.5 |

## Probability Examples

World XI best-observed XI, representative dominance deltas:

| Delta | Base W/D/L | Conversion | Final W/D/L |
|---:|---:|---:|---:|
| -30 | 16.5% / 23.5% / 60.0% | 6.7% | 18.1% / 21.9% / 60.0% |
| -10 | 35.9% / 21.8% / 42.4% | 6.7% | 37.4% / 20.3% / 42.4% |
| 0 | 48.5% / 19.8% / 31.7% | 7.2% | 49.9% / 18.4% / 31.7% |
| 15 | 67.3% / 15.3% / 17.5% | 11.0% | 68.9% / 13.6% / 17.5% |
| 30 | 81.8% / 10.1% / 8.2% | 18.3% | 83.6% / 8.2% / 8.2% |
| 45 | 90.7% / 6.1% / 3.2% | 22.1% | 92.1% / 4.8% / 3.2% |

## Notes

- Existing leaderboard data is preserved; new submissions use `scoringVersion = 2`.
- No perfect/undefeated/invincible claims are post-processed; tiers are derived from actual simulated records and tournament resolutions.
- Penalty advances do not count as perfect tournament runs; group-stage draws remain draws.
