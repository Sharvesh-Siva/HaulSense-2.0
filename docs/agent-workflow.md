# HaulSense Agent Workflow

## Objective

HaulSense is an agentic freight decision platform for small transport operators. The agent decides which evidence is needed, calls deterministic tools, and submits one operational recommendation.

## Golden Rule

**AI decides. Code calculates.**

The model may interpret trade-offs and select tools, but it must not invent or manually calculate financial, margin, fuel, risk, or route-cycle figures. Numerical claims must come from deterministic tool results.

## Decision Flow

```text
Manager request
      ↓
Understand shipment
      ↓
Calculate trip profitability
      ↓
Determine required evidence
      ├── Vehicle missing/incompatible → match_vehicle
      ├── Driver uncertain/high-value/tight deadline → get_trust_passport
      ├── Operational risk relevant → evaluate_risk
      ├── Margin below target → simulate_negotiation
      ├── Return-cycle economics relevant → find_return_trip
      └── Sensitivity needed → what_if_simulator
      ↓
Validate recommendation guardrails
      ↓
submit_recommendation
      ↓
Operational verdict + next action
```

## Core Actions

### ACCEPT
Requires:
- profitability calculated
- risk evaluated
- risk not HIGH
- verified driver reliability >= 70
- economics not below the 10% floor unless a positive return-cycle improvement justifies the outcome

### ACCEPT + SECURE RETURN LOAD
Requires everything needed for ACCEPT plus:
- return-trip search completed
- compatible return load found
- positive cycle improvement
- selected/identified return load

### NEGOTIATE
Requires:
- profitability calculated
- negotiation simulation completed
- commercially realistic counter-offer (<=25% uplift)

If the required uplift exceeds the commercial limit, the correct outcome is REJECT.

### REASSIGN
Requires:
- profitability calculated
- risk evaluated
- ranked available drivers fetched
- replacement driver identified
- replacement driver trust score >=80

### WAIT
Used when a critical prerequisite is genuinely pending and a safe commitment cannot yet be made.

### REJECT
Requires profitability evidence. A loss-making trip or commercially infeasible negotiation can be rejected without unnecessary additional tool calls.

## Tool Responsibilities

| Tool | Responsibility |
|---|---|
| `calculate_trip_profit` | Revenue, fuel, operating cost, profit, margin, break-even |
| `what_if_simulator` | Sensitivity to freight, fuel, toll and mileage changes |
| `get_trust_passport` | Driver reliability and replacement-driver ranking |
| `find_return_trip` | Backhaul compatibility and complete cycle economics |
| `match_vehicle` | Payload/cargo compatibility |
| `simulate_negotiation` | Counter-offer and commercial feasibility |
| `evaluate_risk` | Operational risk score and level |
| `submit_recommendation` | Terminal guarded operational commitment |

## Demo Scenarios

The repository's demo cases should exercise different paths:

1. **Golden case:** profitable outbound + valuable backhaul → ACCEPT + SECURE RETURN LOAD.
2. **Local high-margin case:** strong short haul → ACCEPT.
3. **Low-margin case:** commercially realistic counter-offer → NEGOTIATE.
4. **High-risk assigned driver:** reliable replacement exists → REASSIGN.
5. **Loss-making case:** required uplift is commercially unrealistic → REJECT.

## Operational Principle

HaulSense should not behave like a chatbot that merely describes options. It should behave like a constrained decision agent: gather evidence, invoke tools, validate the action, and produce a clear next operational step.
