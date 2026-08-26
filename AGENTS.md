# AGENTS.md for Astrology Compatibility API

This repo teaches AI coding agents (Cursor, Claude Code, Aider, Codex, Windsurf, RooCode, Gemini CLI) how to use the RoxyAPI compatibility score endpoint.

## Endpoint
- Method: `POST`
- URL: `https://roxyapi.com/api/v2/astrology/compatibility-score`
- Auth: `X-API-Key` header
- Domain: `astrology` (one of 14+ in the RoxyAPI catalog)
- Operation ID: `calculateCompatibility` matches the SDK method name in camelCase
- MCP tool: `post_astrology_compatibility_score` on `https://roxyapi.com/mcp/astrology`

## TypeScript SDK
```ts
import { createRoxy } from '@roxyapi/sdk';
const roxy = createRoxy(process.env.ROXY_API_KEY!);
const { data, error } = await roxy.astrology.calculateCompatibility({
  body: {
    person1: {
      date: '1990-07-15',
      time: '14:30:00',
      latitude: 40.7128,
      longitude: -74.006,
      timezone: 'America/New_York',
    },
    person2: {
      date: '1992-03-20',
      time: '09:15:00',
      latitude: 34.0522,
      longitude: -118.2437,
      timezone: 'America/Los_Angeles',
    },
  },
});
```

## Python SDK
```python
import os
from roxy_sdk import create_roxy
roxy = create_roxy(os.environ["ROXY_API_KEY"])
result = roxy.astrology.calculate_compatibility(
    person1={
        "date": "1990-07-15",
        "time": "14:30:00",
        "latitude": 40.7128,
        "longitude": -74.006,
        "timezone": "America/New_York",
    },
    person2={
        "date": "1992-03-20",
        "time": "09:15:00",
        "latitude": 34.0522,
        "longitude": -118.2437,
        "timezone": "America/Los_Angeles",
    },
)
```

## Setup step (coordinate-dependent endpoint)
Always call `GET /location/search?q={city}` TWICE (once per person) before calling compatibility. Take `latitude`, `longitude`, `timezone` from `cities[0]` and pipe them in. Never ask the user to type coordinates.

```ts
const { data: loc1 } = await roxy.location.searchCities({ query: { q: 'New York' } });
const { data: loc2 } = await roxy.location.searchCities({ query: { q: 'Los Angeles' } });
```

## Request fields
- `person1` (object, required): `date` (YYYY-MM-DD), `time` (HH:MM:SS), `latitude` (-90 to 90), `longitude` (-180 to 180), `timezone` (decimal UTC offset OR IANA name).
- `person2` (object, required): same shape as `person1`. Compared against person1 for inter-chart aspects.
- `timezone` accepts both a decimal offset and an IANA name. Prefer passing `cities[0].timezone` directly. The server resolves the DST-correct offset per birth date independently.

## Response top level keys
- `overallScore`: 0-100 weighted average across the five categories.
- `categories`: romantic, emotional, intellectual, physical, spiritual (each 0-100).
- `persons`: Sun, Moon, Venus, Mars sign and degree for each person.
- `signCompatibility`: Sun, Moon, Venus, Mars sign pair narratives.
- `elementBalance`: fire, earth, air, water counts per chart plus `sharedElement` and a description.
- `archetype`: `label` plus `description`. One of eight archetypes.
- `strengths`, `challenges`: narrative arrays from harmonious and challenging aspects.
- `summary`, `interpretation`: narrative text.
- `aspectBreakdown`: total, harmonious, challenging, neutral counts.
- `keyAspects`: top inter-chart aspects with planet1, planet2, type, orb, interpretation, description.

## Domain rules
- This endpoint requires two full birth data objects. Both `person1` and `person2` are required.
- Always call `/location/search` TWICE, once per person, before calling compatibility. Never hardcode coordinates.
- This is the lightweight scored answer (percent, category breakdown, archetype, sign blocks). For the full practitioner inter-aspect table with orbs and strength use `POST /astrology/synastry` instead.
- `categories.spiritual` can be low even when other categories are high. Each category maps to distinct planetary pairs, so scores diverge by design.
- `elementBalance.sharedElement` is null when the two charts have different dominant elements. Do not treat null as an error.
- Aspect types in `keyAspects[].type`: CONJUNCTION, OPPOSITION, TRINE, SQUARE, SEXTILE, QUINCUNX, SEMISEXTILE, SEMISQUARE, SESQUIQUADRATE.

## Related endpoints
- `POST /astrology/synastry` (`calculateSynastry`): full inter-aspect table with orb, strength, and meaning
- `POST /astrology/natal-chart` (`generateNatalChart`): full natal chart per person with sign, house, interpretation
- `POST /astrology/composite-chart` (`generateCompositeChart`): midpoint composite chart for the relationship itself

## Verified
2026-Q3 against `https://roxyapi.com/api/v2/openapi.json`. Re-fetch the spec for ground truth before changing this file.

## Discovery
- Full catalog: https://roxyapi.com/AGENTS.md
- LLM index: https://roxyapi.com/llms.txt
- Methodology: https://roxyapi.com/methodology
