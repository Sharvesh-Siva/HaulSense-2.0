# HaulSense Demo Scenarios

These scenarios are the acceptance targets for the agent workflow. The application should use deterministic tool outputs as the source of truth for every numerical claim.

## S-GOLDEN — Chennai → Bengaluru

- 7t FMCG
- Offered freight: ₹25,000
- Distance: 350 km
- Expected result: profitable outbound and positive secured-backhaul improvement
- Expected action: **ACCEPT + SECURE RETURN LOAD**

## S-CASE-A — Chennai → Vellore

- 5t general cargo
- Offered freight: ₹12,000
- Distance: 140 km
- Expected result: strong outbound economics
- Expected action: **ACCEPT**

## S-CASE-B — Chennai → Madurai

- 9t general cargo
- Offered freight: ₹21,000
- Distance: 460 km
- Expected result: margin below target but commercially realistic negotiation
- Expected action: **NEGOTIATE**

## S-CASE-D — Chennai → Bengaluru Electronics

- High-value cargo
- Tight delivery deadline
- Assigned driver has materially weaker trust history
- Expected result: high operational risk and an eligible replacement driver
- Expected action: **REASSIGN**

## S-CASE-E — Chennai → Kochi

- 10t general cargo
- Offered freight: ₹24,000
- Distance: 700 km
- Expected result: loss-making trip and commercially unrealistic counter-offer
- Expected action: **REJECT**

## Acceptance Criteria

A scenario is considered successful only when:

1. The agent calls the tools needed for the scenario.
2. Numerical values in the final recommendation originate from tool outputs.
3. The terminal guardrails accept the recommendation.
4. The action matches the intended operational outcome.
5. The recommendation includes a concrete next action.
