# HaulSense — Agentic Freight Decision Platform

HaulSense is an agentic AI decision platform for small transport operators and fleet owners in India. Instead of making dispatch choices from fragmented calls, spreadsheets, and gut feeling, a manager asks the HaulSense Agent whether a shipment should be accepted, negotiated, reassigned, delayed, or rejected.

The agent selects deterministic logistics tools, observes their results, applies business guardrails, and returns one operational recommendation.

## Core Principle

> **AI decides. Code calculates.**

The model interprets the request, selects tools, evaluates trade-offs, and formulates the decision. TypeScript tools perform financial arithmetic, fuel calculations, margins, break-even analysis, risk scoring, driver ranking, vehicle matching, and return-cycle economics.

## Agent Tools

1. `calculate_trip_profit` — fuel cost, operating cost, profit, margin, break-even freight.
2. `what_if_simulator` — sensitivity analysis for freight, fuel, toll, and mileage changes.
3. `get_trust_passport` — driver reliability, incidents, trust score, and ranked replacement candidates.
4. `find_return_trip` — compatible backhaul discovery and complete cycle economics.
5. `match_vehicle` — payload and cargo compatibility.
6. `simulate_negotiation` — target rate, counter-offer, and commercial feasibility.
7. `evaluate_risk` — deterministic operational risk score and level.
8. `submit_recommendation` — terminal decision with business guardrails.

## Supported Decisions

- `ACCEPT`
- `ACCEPT + SECURE RETURN LOAD`
- `NEGOTIATE`
- `REASSIGN`
- `WAIT`
- `REJECT`

## Decision Workflow

```text
Manager request
      ↓
Understand shipment
      ↓
Calculate profitability
      ↓
Select required evidence/tools
      ↓
Profit + trust + risk + vehicle + negotiation/return analysis as needed
      ↓
Guardrail validation
      ↓
Terminal recommendation
      ↓
Concrete next operational action
```

See [`docs/agent-workflow.md`](docs/agent-workflow.md) for the full decision contract and [`docs/demo-scenarios.md`](docs/demo-scenarios.md) for the five acceptance scenarios.

## Running Locally

Requirements: Node.js and npm.

```bash
npm install
```

Create a local `.env` file from `.env.example` and provide a valid Gemini API key:

```bash
cp .env.example .env
```

Then start the application:

```bash
npm run dev
```

Open `http://localhost:3000`.

Useful checks:

```bash
npm run lint
npm run build
```

The repository intentionally contains no Leaflet, OpenStreetMap, or Google Maps dependency in the current implementation. Mapping can be added later as a separate presentation layer if it provides real decision value.

## Demo Access

The application contains demo workspace credentials and seeded logistics data for presentation. These are **demo-only credentials**, not production authentication. See the existing application UI and seeded data for the available demo scenarios.

## Repository Scope

This repository is the active AI Studio implementation of HaulSense. Video creation, final presentation validation, live deployment verification, and judge-facing demonstration are separate final-stage activities.
