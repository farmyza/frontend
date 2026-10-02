# Team Solven Blueprint Audit: Crop Rotation Decision-Support (Mock Prototype)

## Verdict

The approach is correct. Contract-first with a mocked backend is the right way to build this, and the product thinking is strong. The blueprint is heavier than a mock needs, though, and it has inconsistencies that should be fixed before work is split across the team.

---

## What's right

- **A clean API boundary with mocks behind it.** This is the core decision, and it's sound.
- **Storing a polygon, not a point.** This is what makes the NASA data meaningful later.
- **Farmer-facing interpretation on top, evidence underneath.** It serves both usability and the challenge's technical credibility.
- **"ML decides, LLM explains."** A defensible split.
- **The scope cuts in section 28.** Keep them.
- **The frontend never touches NASA APIs.**

---

## Problems to fix

### 1. The contract contradicts itself

This is the most important issue, because the contract is the whole point.

- The mock response in §21 (`soil / weather / vegetation / recommendation`) doesn't match the backend contract in §23 (`diagnostics / environment / recommendations / evidence`).
- The request sends `cropHistory: ["rice", "mung_bean"]`, but the UI asks for current crop and previous crop separately.
- Priorities differ across sections: §8 lists six (including "reduce salinity"), §27 lists five, and the contract uses `soil_health`.
- Water stress is "Low" in §10 but "high" in §21, and it sits under `weather` in the JSON but under its own Water card in the UI.

**Fix:** write the Zod schemas once, derive the TypeScript types from them, and make everything else follow. Add `schemaVersion`, units, `confidence`, data source labels, and an error shape.

### 2. The demo recommendation contradicts itself

- The example reasoning is "reduces water pressure", but the rotation starts with rice, the highest water-demand crop in the list.
- "Mung bean, June–July" looks agronomically off for Bangladesh. As far as I know, mung bean is typically sown around Feb–April or later in the monsoon season, and June–July overlaps with Aman rice. **Verify against a local agronomy source.** Judges who know the region will notice.

### 3. The mock must respond to inputs

If changing water availability or priorities doesn't change the recommendation, the demo looks fake the moment someone tries it.

Build a small deterministic rule engine in the mock layer (about 50 lines):

- limited water + soil priority → legume
- high salinity → salt-tolerant options
- abundant water + yield priority → higher-demand crop

Southwest Bangladesh (Khulna, Satkhira) is salinity country, so make salinity a showcase scenario.

### 4. Be honest about what's simulated

- Add a visible **"Demo data"** badge.
- Label the evidence layer as simulated.
- Don't name specific NASA datasets (SMAP, MODIS, etc.) as sources unless they're really used.

---

## Over-engineered for a mock

| Item | Recommendation |
|---|---|
| TanStack Query | Optional. Plain `fetch` plus loading/error state is enough for three requests. |
| Two folder structures (§20 and §22) | They don't match. Pick one. |
| 5 mock files | One `mock/engine.ts` is enough. |
| Feature-folder split | Fine, but don't spend hours on structure. |
| Zod | **Keep it.** It earns its place here. |

---

## Better than what's proposed

- **Use a Next.js route handler as the mock backend** (`POST /api/v1/diagnostics`) instead of an in-process function. The real HTTP contract gets exercised, and going live means swapping the handler's internals or a base URL.
- **Make one thing real: NASA POWER.** Its API is free, needs no key, and returns rainfall and temperature by lat/lon. Calling it from the route handler puts genuine NASA data in the demo for very little effort.
- **The assistant can be real now.** Send the mock JSON as context to an LLM from a server route, with a system prompt restricting it to the structured analysis.
- **Drawing on mobile is painful.** Offer a "pin + adjustable box" fallback. For the draw library, `terra-draw` has a MapLibre adapter and is easier than the older mapbox-gl-draw.
- **Validate the polygon:** minimum and maximum area, and no self-intersection.
- **Map tiles:** MapLibre needs a tile source. Check the usage terms of whatever you pick (MapTiler's free tier is a safe option). OSM's public tiles aren't meant for heavy use.

---

## Missing

- Loading, error, and empty states
- Bangla/English toggle, or at least i18n scaffolding, since the users are Bangladeshi farmers
- Mobile-first layout
- Persisting state (URL or sessionStorage) so a refresh doesn't wipe the flow
- A confidence indicator on the recommendation
- "Why this recommendation", showing which inputs drove it

---

## Suggested build order

1. Zod schemas and one example response
2. Route-handler mock with the rule engine
3. Field selection map
4. Input form
5. Results screen
6. Real NASA POWER call
7. Assistant
8. Polish, Bangla, demo badge

---

## Next step

Draft the unified Zod schemas and a rule-engine mock that fix the contradictions above. That's the piece the whole team will depend on.
